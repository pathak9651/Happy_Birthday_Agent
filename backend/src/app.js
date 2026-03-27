import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { createDeliveryHistory, listDeliveryHistory } from "./data/deliveryHistoryRepository.js";
import {
  listRecipientProfiles,
  markRecipientDeliveryActivity,
  markRecipientMessageActivity,
  upsertRecipientProfile
} from "./data/recipientRepository.js";
import { createSchedule, listSchedules } from "./data/scheduleRepository.js";
import { deliverScheduledWish } from "./delivery/deliverScheduledWish.js";
import { getDatabaseStatus } from "./db/connectToDatabase.js";
import { generateMessage } from "./services/messageGenerator.js";
import { promptPresets } from "./services/promptBuilder.js";

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
    recipientPhone: "",
    repeatYearly: body.repeatYearly !== false
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

async function getRecipientContext(input, delivery = {}) {
  const recipient = await upsertRecipientProfile({
    ...input,
    ...delivery
  });

  return {
    recipient,
    recipientId: recipient._id.toString()
  };
}

async function generateWishResponse(input, recipientId = null) {
  const generated = await generateMessage(input);
  const createdAt = new Date();

  await markRecipientMessageActivity(recipientId, createdAt);

  return {
    id: `${createdAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    recipientId,
    ...input,
    ...generated,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString()
  };
}

async function logDeliveryHistory({
  recipientId,
  recipientName,
  deliveryChannel,
  status,
  destination = "",
  provider = "",
  externalId = "",
  messageId = null,
  scheduleId = null,
  errorMessage = ""
}) {
  const entry = await createDeliveryHistory({
    recipientId,
    recipientName,
    deliveryChannel,
    status,
    destination,
    provider,
    externalId,
    messageId,
    scheduleId,
    errorMessage
  });

  if (status === "sent") {
    await markRecipientDeliveryActivity(recipientId, new Date());
  }

  return entry;
}

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.frontendOrigin }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "birthday-agent-backend", database: getDatabaseStatus() });
  });

  app.get("/api/presets", (_req, res) => {
    res.json(promptPresets);
  });

  app.get("/api/messages", (_req, res) => {
    res.json([]);
  });

  app.get("/api/schedules", async (_req, res, next) => {
    try {
      res.json(await listSchedules());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/recipients", async (_req, res, next) => {
    try {
      res.json(await listRecipientProfiles());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/delivery-history", async (_req, res, next) => {
    try {
      res.json(await listDeliveryHistory());
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/generate", async (req, res, next) => {
    try {
      const body = req.body || {};
      if (!body.name || !body.relationship || !body.style) {
        res.status(400).json({ error: "name, relationship, and style are required" });
        return;
      }

      const normalizedInput = normalizeWishInput(body);
      const { recipientId } = await getRecipientContext(normalizedInput);
      res.status(201).json(await generateWishResponse(normalizedInput, recipientId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/send-test", async (req, res, next) => {
    try {
      const body = req.body || {};
      if (!body.name || !body.relationship || !body.style) {
        res.status(400).json({ error: "name, relationship, and style are required" });
        return;
      }

      const normalizedInput = normalizeWishInput(body);
      const delivery = normalizeScheduleDelivery(body);
      validateScheduleDelivery(delivery);

      const { recipientId } = await getRecipientContext(normalizedInput, delivery);
      const generated = await generateWishResponse(normalizedInput, recipientId);
      const deliveryResult = await deliverScheduledWish({
        schedule: { ...normalizedInput, ...delivery },
        message: generated.message
      });

      const deliveryStatus = delivery.deliveryChannel === "in_app" ? "skipped" : "sent";
      await logDeliveryHistory({
        recipientId,
        recipientName: normalizedInput.name,
        deliveryChannel: delivery.deliveryChannel,
        status: deliveryStatus,
        destination: delivery.recipientEmail || "",
        provider: delivery.deliveryChannel === "email" ? "nodemailer" : "in_app",
        externalId: deliveryResult.externalId || "",
        messageId: null
      });

      res.status(201).json({
        message: generated,
        delivery: {
          channel: deliveryResult.channel,
          externalId: deliveryResult.externalId || "",
          status: deliveryStatus
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
        res.status(400).json({ error: "name, relationship, style, and scheduledFor are required" });
        return;
      }

      const scheduledDate = new Date(body.scheduledFor);
      if (Number.isNaN(scheduledDate.getTime())) {
        res.status(400).json({ error: "scheduledFor must be a valid ISO date" });
        return;
      }

      const normalizedInput = normalizeWishInput(body);
      const delivery = normalizeScheduleDelivery(body);
      validateScheduleDelivery(delivery);
      const { recipientId } = await getRecipientContext(normalizedInput, delivery);

      const savedSchedule = await createSchedule({
        ...normalizedInput,
        ...delivery,
        recipientId,
        scheduledFor: scheduledDate
      });

      res.status(201).json(savedSchedule);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
  });

  return app;
}
