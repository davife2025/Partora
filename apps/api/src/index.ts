import { app }                   from "./app.js";
import { config }                from "./config/env.js";
import { setupCoachWebSocket }   from "./controllers/coach.controller.js";

const server = app.listen(config.port, () => {
  console.info(`🎵 Partora API running on http://localhost:${config.port}`);
  console.info(`   Environment: ${config.nodeEnv}`);
});

// Attach WebSocket server to the same HTTP server
setupCoachWebSocket(server);
console.info(`🎤 Voice coach WebSocket ready at ws://localhost:${config.port}/ws/coach`);

process.on("SIGTERM", () => {
  console.info("SIGTERM — shutting down gracefully");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.info("SIGINT — shutting down gracefully");
  server.close(() => process.exit(0));
});
