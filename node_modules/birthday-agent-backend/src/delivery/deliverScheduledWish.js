import { sendEmailDelivery } from "./emailDelivery.js";
import { sendTwilioDelivery } from "./twilioDelivery.js";

export async function deliverScheduledWish({ schedule, message }) {
  if (schedule.deliveryChannel === "in_app") {
    return {
      channel: "in_app",
      externalId: ""
    };
  }

  if (schedule.deliveryChannel === "email") {
    return sendEmailDelivery({
      recipientEmail: schedule.recipientEmail,
      recipientName: schedule.name,
      message
    });
  }

  if (schedule.deliveryChannel === "sms" || schedule.deliveryChannel === "whatsapp") {
    return sendTwilioDelivery({
      channel: schedule.deliveryChannel,
      recipientPhone: schedule.recipientPhone,
      message
    });
  }

  const error = new Error(`Unsupported delivery channel: ${schedule.deliveryChannel}`);
  error.statusCode = 400;
  throw error;
}
