import { createApp } from "./app.js";
import { connectToDatabase } from "./db/connectToDatabase.js";
import { startScheduler } from "./scheduler/startScheduler.js";
import { config } from "./config.js";

const app = createApp();

async function startServer() {
  await connectToDatabase();
  startScheduler();

  const server = app.listen(config.port, () => {
    console.log(`Birthday agent backend running on http://localhost:${config.port}`);
  });

  server.on("error", (error) => {
    if (error?.code === "EADDRINUSE") {
      console.error(
        `Port ${config.port} is already in use. Stop the existing process or set a different PORT.`
      );
      process.exit(1);
    }

    throw error;
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
