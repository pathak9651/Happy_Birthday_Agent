import mongoose from "mongoose";
import { config } from "../config.js";

let hasConnected = false;

export async function connectToDatabase() {
  if (hasConnected) {
    return mongoose.connection;
  }

  await mongoose.connect(config.mongoUri);
  hasConnected = true;

  return mongoose.connection;
}

export function getDatabaseStatus() {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
}
