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

export async function createNextYearSchedule(schedule) {
  if (!schedule.repeatYearly) {
    return null;
  }

  const nextDate = new Date(schedule.scheduledFor);
  nextDate.setFullYear(nextDate.getFullYear() + 1);

  const nextSchedule = await ScheduledWish.create({
    recipientId: schedule.recipientId || null,
    sourceScheduleId: schedule._id,
    name: schedule.name,
    relationship: schedule.relationship,
    style: schedule.style,
    promptType: schedule.promptType,
    age: schedule.age,
    interests: schedule.interests,
    useLiveAi: schedule.useLiveAi,
    deliveryChannel: schedule.deliveryChannel,
    recipientEmail: schedule.recipientEmail,
    recipientPhone: schedule.recipientPhone,
    repeatYearly: true,
    scheduledFor: nextDate,
    deliveryStatus: "pending",
    deliveryExternalId: "",
    deliveredAt: null,
    status: "pending",
    processedAt: null,
    lastError: "",
    generatedMessageId: null
  });

  return nextSchedule.toJSON();
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
