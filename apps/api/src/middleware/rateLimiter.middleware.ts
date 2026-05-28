import { rateLimit } from "express-rate-limit";

/** Strict limiter for expensive AI operations */
export const analysisLimiter = rateLimit({
  windowMs:  60 * 60 * 1000, // 1 hour
  max:       20,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? "anon",
  message: { success: false, error: "Analysis limit reached. Please wait before analysing more songs." },
});

/** Limiter for audio upload */
export const uploadLimiter = rateLimit({
  windowMs:  60 * 60 * 1000,
  max:       10,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? "anon",
  message: { success: false, error: "Upload limit reached. Please wait before uploading more files." },
});

/** Limiter for search (lenient) */
export const searchLimiter = rateLimit({
  windowMs:  60 * 1000, // 1 minute
  max:       30,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? "anon",
  message: { success: false, error: "Too many search requests. Please slow down." },
});

/** Limiter for voice coach WebSocket token */
export const coachLimiter = rateLimit({
  windowMs:  60 * 1000,
  max:       10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: "Too many coach connection attempts." },
});
