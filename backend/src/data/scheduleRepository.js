import { ScheduledWish } from "../db/scheduledWish.model.js";

export async function createSchedule(schedule) {
  const saved = await ScheduledWish.create(schedule);
  return saved.toJSON();
}

export async function listSchedules(limit = 50) {
  const schedules = await ScheduledWish.find()
    .sort({ scheduledFor: 1, createdAt: -1 })
    .limit(limit)
    .lean(false);

  return schedules.map((schedule) => schedule.toJSON());
}

export async function listDueSchedules(now = new Date()) {
  return ScheduledWish.find({
    status: "pending",
    scheduledFor: { $lte: now }
  }).sort({ scheduledFor: 1 });
}

export async function markScheduleProcessed(scheduleId, generatedMessageId, deliveryResult = {}) {
  const updated = await ScheduledWish.findByIdAndUpdate(
    scheduleId,
    {
      status: "processed",
      processedAt: new Date(),
      lastError: "",
      generatedMessageId,
      deliveryStatus: deliveryResult.deliveryStatus || "skipped",
      deliveryExternalId: deliveryResult.externalId || "",
      deliveredAt: deliveryResult.deliveredAt || null
    },
    { new: true }
  );

  return updated?.toJSON() || null;
}

export async function markScheduleFailed(scheduleId, errorMessage) {
  const updated = await ScheduledWish.findByIdAndUpdate(
    scheduleId,
    {
      status: "failed",
      processedAt: new Date(),
      lastError: errorMessage,
      deliveryStatus: "failed"
    },
    { new: true }
  );

  return updated?.toJSON() || null;
}
