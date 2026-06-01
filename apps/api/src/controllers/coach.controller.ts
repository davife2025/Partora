import { WebSocketServer, WebSocket } from "ws";
import type { Server }                from "http";
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest }  from "../middleware/auth.middleware.js";
import { supabaseAdmin }              from "../config/supabase.js";
import { CoachSession }               from "../services/speechEngine.service.js";
import type { CoachContext }          from "../services/speechEngine.service.js";
import type { VoicePart }             from "@partora/types";

const sessions = new Map<string, CoachSession>();

export async function getWsToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token     = crypto.randomUUID();
    const expiresAt = Date.now() + 30_000;
    await supabaseAdmin.from("coach_tokens").upsert({
      token,
      user_id:    req.userId!,
      expires_at: new Date(expiresAt).toISOString(),
    });
    res.json({ success: true, data: { token, expires_at: expiresAt } });
  } catch (e) { next(e); }
}

export function setupCoachWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (req: Request, socket, head) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    if (!url.pathname.startsWith("/ws/coach")) { socket.destroy(); return; }

    const token  = url.searchParams.get("token");
    const userId = await validateWsToken(token ?? "");
    if (!userId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req as unknown as import("http").IncomingMessage, socket, head, (ws) => {
      wss.emit("connection", ws, req, userId, url.searchParams);
    });
  });

  wss.on("connection", (ws: WebSocket, _req: unknown, userId: string, params: URLSearchParams) => {
    const context: CoachContext = {
      voicePart: (params.get("voice_part") ?? undefined) as VoicePart | undefined,
      songTitle: params.get("song_title")  ?? undefined,
      artist:    params.get("artist")      ?? undefined,
      key:       params.get("key")         ?? undefined,
      mode:      params.get("mode")        ?? undefined,
    };
    const session = new CoachSession(ws, userId, context);
    sessions.set(userId, session);
    ws.on("close", () => sessions.delete(userId));
  });

  return wss;
}

async function validateWsToken(token: string): Promise<string | null> {
  if (!token) return null;
  const { data, error } = await supabaseAdmin
    .from("coach_tokens").select("user_id,expires_at").eq("token", token).single();
  if (error || !data) return null;
  if (new Date(data.expires_at as string) < new Date()) {
    await supabaseAdmin.from("coach_tokens").delete().eq("token", token);
    return null;
  }
  await supabaseAdmin.from("coach_tokens").delete().eq("token", token);
  return data.user_id as string;
}