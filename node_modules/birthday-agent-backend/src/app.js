import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { listMessages, saveMessage } from "./data/messageRepository.js";
import { getDatabaseStatus } from "./db/connectToDatabase.js";
import { promptPresets } from "./services/promptBuilder.js";
import { generateMessage } from "./services/messageGenerator.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.frontendOrigin
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "birthday-agent-backend",
      database: getDatabaseStatus()
    });
  });

  app.get("/api/presets", (_req, res) => {
    res.json(promptPresets);
  });

  app.get("/api/messages", async (_req, res, next) => {
    try {
      const messages = await listMessages();
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/generate", async (req, res, next) => {
    try {
      const body = req.body || {};

      if (!body.name || !body.relationship || !body.style) {
        res.status(400).json({
          error: "name, relationship, and style are required"
        });
        return;
      }

      const normalizedInput = {
        name: String(body.name).trim(),
        relationship: String(body.relationship).trim(),
        style: String(body.style).trim().toLowerCase(),
        promptType: String(body.promptType || "universal").trim().toLowerCase(),
        age: body.age ? String(body.age).trim() : "",
        interests: Array.isArray(body.interests)
          ? body.interests.map((item) => String(item).trim()).filter(Boolean)
          : [],
        useLiveAi: Boolean(body.useLiveAi)
      };

      const generated = await generateMessage(normalizedInput);
      const saved = await saveMessage({
        ...normalizedInput,
        ...generated
      });

      res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Internal server error"
    });
  });

  return app;
}
