import cron from "node-cron";
import { createDeliveryHistory } from "../data/deliveryHistoryRepository.js";
import { saveMessage } from "../data/messageRepository.js";
import {
  markRecipientDeliveryActivity,
  markRecipientMessageActivity
} from "../data/recipientRepository.js";
import {
  listDueSchedules,
  markScheduleFailed,
  markScheduleProcessed
} from "../data/scheduleRepository.js";
import { deliverScheduledWish } from "../delivery/deliverScheduledWish.js";
import { generateMessage } from "../services/messageGenerator.js";

let isProcessing = false;

async function processDueSchedules() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    const dueSchedules = await listDueSchedules(new Date());

    for (const schedule of dueSchedules) {
      try {
        const scheduleInput = {
          name: schedule.name,
          relationship: schedule.relationship,
          style: schedule.style,
          promptType: schedule.promptType,
          age: schedule.age,
          interests: schedule.interests,
          useLiveAi: schedule.useLiveAi
        };

        const generated = await generateMessage(scheduleInput);
        const savedMessage = await saveMessage({
          ...scheduleInput,
          recipientId: schedule.recipientId ? schedule.recipientId.toString() : null,
          ...generated
        });

        await markRecipientMessageActivity(schedule.recipientId ? schedule.recipientId.toString() : null, new Date());

        let deliveryResult = {
          deliveryStatus: "skipped",
          externalId: "",
          deliveredAt: null,
          provider: "in_app"
        };

        if (schedule.deliveryChannel && schedule.deliveryChannel !== "in_app") {
          const sent = await deliverScheduledWish({
            schedule,
            message: generated.message
          });

          deliveryResult = {
            deliveryStatus: "sent",
            externalId: sent.externalId || "",
            deliveredAt: new Date(),
            provider: "nodemailer"
          };

          await markRecipientDeliveryActivity(schedule.recipientId ? schedule.recipientId.toString() : null, new Date());
        }

        await createDeliveryHistory({
          recipientId: schedule.recipientId || null,
          recipientName: schedule.name,
          deliveryChannel: schedule.deliveryChannel,
          status: deliveryResult.deliveryStatus,
          destination: schedule.recipientEmail || "",
          provider: deliveryResult.provider,
          externalId: deliveryResult.externalId,
          messageId: savedMessage.id,
          scheduleId: schedule._id.toString(),
          errorMessage: ""
        });

        await markScheduleProcessed(schedule._id, savedMessage.id, deliveryResult);
        console.log(`Processed scheduled wish for ${schedule.name}`);
      } catch (error) {
        await createDeliveryHistory({
          recipientId: schedule.recipientId || null,
          recipientName: schedule.name,
          deliveryChannel: schedule.deliveryChannel,
          status: "failed",
          destination: schedule.recipientEmail || "",
          provider: schedule.deliveryChannel === "email" ? "nodemailer" : "in_app",
          externalId: "",
          messageId: null,
          scheduleId: schedule._id.toString(),
          errorMessage: error.message || "Schedule processing failed"
        });
        await markScheduleFailed(schedule._id, error.message || "Schedule processing failed");
        console.error(`Failed scheduled wish for ${schedule.name}`, error);
      }
    }
  } finally {
    isProcessing = false;
  }
}

export function startScheduler() {
  cron.schedule("* * * * *", () => {
    processDueSchedules().catch((error) => {
      console.error("Scheduler loop failed", error);
    });
  });

  processDueSchedules().catch((error) => {
    console.error("Initial scheduler run failed", error);
  });
}
