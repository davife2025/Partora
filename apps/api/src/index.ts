import { app } from "./app.js";
import { config } from "./config/env.js";

const server = app.listen(config.port, () => {
  console.info(`🎵 Partora API running on http://localhost:${config.port}`);
  console.info(`   Environment: ${config.nodeEnv}`);
});

process.on("SIGTERM", () => {
  console.info("SIGTERM received — shutting down gracefully");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.info("SIGINT received — shutting down gracefully");
  server.close(() => process.exit(0));
});
