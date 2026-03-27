import { createApp } from "./app.js";
import { connectToDatabase } from "./db/connectToDatabase.js";
import { startScheduler } from "./scheduler/startScheduler.js";
import { config } from "./config.js";

const app = createApp();

async function startServer() {
  await connectToDatabase();
  startScheduler();

  app.listen(config.port, () => {
    console.log(`Birthday agent backend running on http://localhost:${config.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
