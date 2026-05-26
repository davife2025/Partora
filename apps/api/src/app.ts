import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { config } from "./config/env.js";
import { analysisRouter } from "./routes/analysis.routes.js";
import { searchRouter }   from "./routes/search.routes.js";
import { uploadRouter }   from "./routes/upload.routes.js";
import { recordRouter }   from "./routes/record.routes.js";
import { coachRouter }    from "./routes/coach.routes.js";
import { userRouter }     from "./routes/user.routes.js";
import { errorHandler }   from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

// Start queue processor (import triggers Bull worker)
import "./services/queue.service.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.api.corsOrigin, credentials: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests" },
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== "test") app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Partora API running", env: config.nodeEnv });
});

app.use("/api/user",     authMiddleware, userRouter);
app.use("/api/analysis", authMiddleware, analysisRouter);
app.use("/api/search",   authMiddleware, searchRouter);
app.use("/api/upload",   authMiddleware, uploadRouter);
app.use("/api/record",   authMiddleware, recordRouter);
app.use("/api/coach",    authMiddleware, coachRouter);

app.use(errorHandler);

export { app };
