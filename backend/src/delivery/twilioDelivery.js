import twilio from "twilio";
import { config } from "../config.js";

let client;

function getTwilioClient() {
  if (!config.twilioAccountSid || !config.twilioAuthToken) {
    const error = new Error("Twilio configuration is incomplete");
    error.statusCode = 400;
    throw error;
  }

  if (!client) {
    client = twilio(config.twilioAccountSid, config.twilioAuthToken);
  }

  return client;
}

export async function sendTwilioDelivery({ channel, recipientPhone, message }) {
  if (!recipientPhone) {
    const error = new Error("recipientPhone is required for Twilio delivery");
    error.statusCode = 400;
    throw error;
  }

  const twilioClient = getTwilioClient();
  const fromNumber = channel === "whatsapp" ? config.twilioWhatsappNumber : config.twilioPhoneNumber;

  if (!fromNumber) {
    const error = new Error(`Missing Twilio sender number for ${channel}`);
    error.statusCode = 400;
    throw error;
  }

  const formattedTo = channel === "whatsapp" ? `whatsapp:${recipientPhone}` : recipientPhone;
  const formattedFrom = channel === "whatsapp" ? `whatsapp:${fromNumber}` : fromNumber;

  const response = await twilioClient.messages.create({
    from: formattedFrom,
    to: formattedTo,
    body: message
  });

  return {
    channel,
    externalId: response.sid || ""
  };
}
