import mongoose from "mongoose";
import { config } from "../config.js";

let hasConnected = false;

export async function connectToDatabase() {
  if (hasConnected) {
    return mongoose.connection;
  }

  if (!config.mongoUri) {
    const error = new Error("MONGODB_URI is required. Use your MongoDB Atlas connection string in backend/.env or deployment env vars.");
    error.statusCode = 500;
    throw error;
  }

  await mongoose.connect(config.mongoUri);
  hasConnected = true;

  return mongoose.connection;
}

export function getDatabaseStatus() {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
}
