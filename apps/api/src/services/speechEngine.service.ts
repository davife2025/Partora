import WebSocket from "ws";
import { ElevenLabsClient } from "elevenlabs";
import { InferenceClient }  from "@huggingface/inference";
import { config }           from "../config/env.js";
import { VOICE_IDS }        from "./elevenlabs.service.js";
import type { VoicePart }   from "@partora/types";

const elevenlabs = new ElevenLabsClient({ apiKey: config.elevenlabs.apiKey });
const kimi       = new InferenceClient(config.huggingface.apiKey);

// ─── Coach system prompt ──────────────────────────────────────────
function buildCoachSystemPrompt(context?: CoachContext): string {
  const partContext = context?.voicePart
    ? `The user sings the ${context.voicePart} part.`
    : "The user has not specified their voice part yet.";

  const songContext = context?.songTitle
    ? `They are currently working on "${context.songTitle}"${context.artist ? ` by ${context.artist}` : ""}` +
      ` in ${context.key ?? "an unknown key"} ${context.mode ?? ""}.`
    : "They have not selected a song yet.";

  return `You are Partora's AI voice coach — an expert in choral singing, tonic solfa, SATB harmony, and music theory.

${partContext} ${songContext}

Your role:
- Answer questions about tonic solfa notation (Do Re Mi Fa Sol La Ti)
- Explain voice parts (Soprano, Alto, Tenor, Bass) and their ranges
- Help singers understand intervals, harmonies, and chord progressions
- Give practical singing tips for each voice part
- Explain music theory concepts in simple, accessible language
- Reference the current song and key when relevant

Rules:
- Keep answers concise and conversational (2–4 sentences for most questions)
- Use musical terminology naturally but explain it when introducing it
- Be encouraging and supportive
- Never make up specific notes or solfa patterns without basis in music theory
- If asked to sing or demonstrate, explain that you can speak the solfa syllables`;
}

// ─── Context passed from frontend ────────────────────────────────
export interface CoachContext {
  voicePart?:  VoicePart;
  songTitle?:  string;
  artist?:     string;
  key?:        string;
  mode?:       string;
  solfaText?:  string;
}

// ─── Conversation message ─────────────────────────────────────────
export interface CoachMessage {
  role:      "user" | "assistant";
  content:   string;
  audio_url?: string;
  timestamp:  string;
}

// ─── WebSocket session handler ────────────────────────────────────
export class CoachSession {
  private ws:       WebSocket;
  private context:  CoachContext;
  private history:  Array<{ role: "user" | "assistant"; content: string }> = [];
  private userId:   string;

  constructor(ws: WebSocket, userId: string, context: CoachContext = {}) {
    this.ws      = ws;
    this.userId  = userId;
    this.context = context;

    this.ws.on("message", (data) => this.handleMessage(data));
    this.ws.on("close",   ()     => this.handleClose());
    this.ws.on("error",   (err)  => this.handleError(err));

    // Send ready signal
    this.send({ type: "ready", message: "Voice coach connected. Ask me anything about your voice part." });
  }

  // ── Handle incoming message ─────────────────────────────────
  private async handleMessage(data: WebSocket.RawData) {
    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(data.toString()) as ClientMessage;
    } catch {
      this.sendError("Invalid message format");
      return;
    }

    switch (parsed.type) {
      case "text":
        await this.handleTextMessage(parsed.content);
        break;
      case "context_update":
        this.context = { ...this.context, ...parsed.context };
        this.send({ type: "context_updated" });
        break;
      case "ping":
        this.send({ type: "pong" });
        break;
      default:
        this.sendError(`Unknown message type: ${(parsed as { type: string }).type}`);
    }
  }

  // ── Process text query via Kimi K2.6 → ElevenLabs TTS ───────
  private async handleTextMessage(userText: string) {
    if (!userText?.trim()) return;

    // Add to history
    this.history.push({ role: "user", content: userText });

    // Signal typing
    this.send({ type: "thinking" });

    try {
      // Step 1 — Kimi K2.6 generates coach response
      const response = await this.generateCoachResponse(userText);

      // Add to history
      this.history.push({ role: "assistant", content: response });

      // Step 2 — ElevenLabs TTS the response (streaming)
      this.send({ type: "text_response", content: response });

      // Step 3 — Generate audio using Flash v2.5 (75ms latency)
      await this.streamAudioResponse(response);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Coach error";
      this.sendError(msg);
    }
  }

  // ── Kimi K2.6 response generation ───────────────────────────
  private async generateCoachResponse(userText: string): Promise<string> {
    const messages = [
      { role: "system" as const, content: buildCoachSystemPrompt(this.context) },
      ...this.history.slice(-10), // keep last 10 turns for context
      { role: "user"   as const, content: userText },
    ];

    const output = await kimi.chatCompletion({
      model:       config.huggingface.modelId,
      messages,
      max_tokens:  300,
      temperature: 0.7,
    });

    return output.choices[0]?.message?.content?.trim() ?? "I'm not sure about that. Could you rephrase?";
  }

  // ── ElevenLabs Flash v2.5 streaming TTS ─────────────────────
  private async streamAudioResponse(text: string) {
    const voicePart = this.context.voicePart ?? "soprano";
    const voiceId   = VOICE_IDS[voicePart];

    try {
      // Use Flash v2.5 for lowest latency (75ms)
      const audioStream = await (elevenlabs as unknown as {
        textToSpeech: {
          convertAsStream: (
            voiceId: string,
            opts: {
              text: string;
              model_id: string;
              voice_settings: {
                stability: number;
                similarity_boost: number;
              };
              output_format: string;
            }
          ) => Promise<AsyncIterable<Buffer>>;
        };
      }).textToSpeech.convertAsStream(voiceId, {
        text,
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability:        0.7,
          similarity_boost: 0.8,
        },
        output_format: "mp3_44100_128",
      });

      // Stream audio chunks to client as base64
      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        chunks.push(buf);

        // Send each chunk immediately for streaming playback
        this.send({
          type:       "audio_chunk",
          chunk_b64:  buf.toString("base64"),
          mime_type:  "audio/mpeg",
        });
      }

      // Signal audio complete
      this.send({ type: "audio_complete", total_bytes: chunks.reduce((n, c) => n + c.length, 0) });

    } catch (err) {
      console.warn("TTS streaming failed, text response already sent:", err);
      this.send({ type: "audio_error", message: "Audio unavailable — text response sent above." });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  private send(payload: ServerMessage) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private sendError(message: string) {
    this.send({ type: "error", message });
  }

  private handleClose() {
    console.info(`Coach session closed for user ${this.userId}`);
  }

  private handleError(err: Error) {
    console.error(`Coach WebSocket error for user ${this.userId}:`, err.message);
  }

  updateContext(ctx: Partial<CoachContext>) {
    this.context = { ...this.context, ...ctx };
  }
}

// ─── Message type definitions ──────────────────────────────────────
type ClientMessage =
  | { type: "text";           content: string }
  | { type: "context_update"; context: Partial<CoachContext> }
  | { type: "ping" };

type ServerMessage =
  | { type: "ready";           message: string }
  | { type: "thinking" }
  | { type: "text_response";   content: string }
  | { type: "audio_chunk";     chunk_b64: string; mime_type: string }
  | { type: "audio_complete";  total_bytes: number }
  | { type: "audio_error";     message: string }
  | { type: "context_updated" }
  | { type: "pong" }
  | { type: "error";           message: string };
