import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { listMessages, saveMessage } from "./data/messageRepository.js";
import { createSchedule, listSchedules } from "./data/scheduleRepository.js";
import { deliverScheduledWish } from "./delivery/deliverScheduledWish.js";
import { getDatabaseStatus } from "./db/connectToDatabase.js";
import { promptPresets } from "./services/promptBuilder.js";
import { generateMessage } from "./services/messageGenerator.js";

function normalizeWishInput(body) {
  return {
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
}

function normalizeScheduleDelivery(body) {
  return {
    deliveryChannel: String(body.deliveryChannel || "in_app").trim().toLowerCase(),
    recipientEmail: body.recipientEmail ? String(body.recipientEmail).trim() : "",
    recipientPhone: ""
  };
}

function validateScheduleDelivery(delivery) {
  if (delivery.deliveryChannel !== "in_app" && delivery.deliveryChannel !== "email") {
    const error = new Error("Only in_app and email delivery are supported");
    error.statusCode = 400;
    throw error;
  }

  if (delivery.deliveryChannel === "email" && !delivery.recipientEmail) {
    const error = new Error("recipientEmail is required for email delivery");
    error.statusCode = 400;
    throw error;
  }
}

async function generateAndStoreMessage(input) {
  const generated = await generateMessage(input);
  const saved = await saveMessage({
    ...input,
    ...generated
  });

  return saved;
}

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

  app.get("/api/schedules", async (_req, res, next) => {
    try {
      const schedules = await listSchedules();
      res.json(schedules);
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

      const normalizedInput = normalizeWishInput(body);
      const saved = await generateAndStoreMessage(normalizedInput);

      res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/send-test", async (req, res, next) => {
    try {
      const body = req.body || {};

      if (!body.name || !body.relationship || !body.style) {
        res.status(400).json({
          error: "name, relationship, and style are required"
        });
        return;
      }

      const normalizedInput = normalizeWishInput(body);
      const delivery = normalizeScheduleDelivery(body);
      validateScheduleDelivery(delivery);

      const saved = await generateAndStoreMessage(normalizedInput);
      const deliveryResult = await deliverScheduledWish({
        schedule: {
          ...normalizedInput,
          ...delivery
        },
        message: saved.message
      });

      res.status(201).json({
        message: saved,
        delivery: {
          channel: deliveryResult.channel,
          externalId: deliveryResult.externalId || "",
          status: delivery.deliveryChannel === "in_app" ? "skipped" : "sent"
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/schedules", async (req, res, next) => {
    try {
      const body = req.body || {};

      if (!body.name || !body.relationship || !body.style || !body.scheduledFor) {
        res.status(400).json({
          error: "name, relationship, style, and scheduledFor are required"
        });
        return;
      }

      const scheduledDate = new Date(body.scheduledFor);

      if (Number.isNaN(scheduledDate.getTime())) {
        res.status(400).json({
          error: "scheduledFor must be a valid ISO date"
        });
        return;
      }

      const normalizedInput = normalizeWishInput(body);
      const delivery = normalizeScheduleDelivery(body);
      validateScheduleDelivery(delivery);

      const savedSchedule = await createSchedule({
        ...normalizedInput,
        ...delivery,
        scheduledFor: scheduledDate
      });

      res.status(201).json(savedSchedule);
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
