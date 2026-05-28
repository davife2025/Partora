import express        from "express";
import cors           from "cors";
import helmet         from "helmet";
import { rateLimit }  from "express-rate-limit";
import { config }                from "./config/env.js";
import { analysisRouter }        from "./routes/analysis.routes.js";
import { searchRouter }          from "./routes/search.routes.js";
import { uploadRouter }          from "./routes/upload.routes.js";
import { recordRouter }          from "./routes/record.routes.js";
import { coachRouter }           from "./routes/coach.routes.js";
import { userRouter }            from "./routes/user.routes.js";
import { singRouter }            from "./routes/sing.routes.js";
import { errorHandler }          from "./middleware/error.middleware.js";
import { authMiddleware }        from "./middleware/auth.middleware.js";
import { requestLogger }         from "./utils/logger.js";
import {
  analysisLimiter,
  uploadLimiter,
  searchLimiter,
  coachLimiter,
} from "./middleware/rateLimiter.middleware.js";

// Start queue processor
import "./services/queue.service.js";

const app = express();

// ── Security ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // needed for audio playback
}));
app.use(cors({ origin: config.api.corsOrigin, credentials: true }));

// ── Global rate limit ───────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: "Too many requests" },
}));

// ── Parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──────────────────────────────────────────────────────
app.use(requestLogger);

// ── Health ───────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Partora API running", env: config.nodeEnv, ts: new Date().toISOString() });
});

// ── Routes with per-route limits ─────────────────────────────────
app.use("/api/user",     authMiddleware, userRouter);
app.use("/api/analysis", authMiddleware, analysisLimiter, analysisRouter);
app.use("/api/search",   authMiddleware, searchLimiter,   searchRouter);
app.use("/api/upload",   authMiddleware, uploadLimiter,   uploadRouter);
app.use("/api/record",   authMiddleware, analysisLimiter, recordRouter);
app.use("/api/coach",    authMiddleware, coachLimiter,    coachRouter);
app.use("/api/sing",     authMiddleware, singRouter);

app.use(errorHandler);

export { app };
