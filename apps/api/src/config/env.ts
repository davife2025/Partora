import "dotenv/config";

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port:    parseInt(optional("PORT", "4000"), 10),
  nodeEnv: optional("NODE_ENV", "development"),

  supabase: {
    url:            required("SUPABASE_URL"),
    anonKey:        required("SUPABASE_ANON_KEY"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  },

  elevenlabs: {
    apiKey:        required("ELEVENLABS_API_KEY"),
    voiceSoprano:  optional("ELEVENLABS_VOICE_SOPRANO", "21m00Tcm4TlvDq8ikWAM"),
    voiceAlto:     optional("ELEVENLABS_VOICE_ALTO",    "AZnzlk1XvdvUeBnXmlld"),
    voiceTenor:    optional("ELEVENLABS_VOICE_TENOR",   "ErXwobaYiN019PkySvjV"),
    voiceBass:     optional("ELEVENLABS_VOICE_BASS",    "VR6AewLTigWG4xSOukaG"),
  },

  huggingface: {
    apiKey:        required("HUGGINGFACE_API_KEY"),
    modelId:       optional("HUGGINGFACE_MODEL_ID", "moonshotai/Kimi-K2.6"),
    modelSoprano:  optional("HF_MODEL_SOPRANO", "ASLP-lab/DiffSinger"),
    modelAlto:     optional("HF_MODEL_ALTO",    "ASLP-lab/DiffSinger"),
    modelTenor:    optional("HF_MODEL_TENOR",   "ASLP-lab/DiffSinger"),
    modelBass:     optional("HF_MODEL_BASS",    "ASLP-lab/DiffSinger"),
  },

  audd: {
    token: required("AUDD_API_TOKEN"),
  },

  redis: {
    host: optional("REDIS_HOST", "localhost"),
    port: parseInt(optional("REDIS_PORT", "6379"), 10),
  },

  api: {
    secret:     required("API_SECRET"),
    corsOrigin: optional("CORS_ORIGIN", "http://localhost:3000"),
  },
} as const;
