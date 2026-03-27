import nodemailer from "nodemailer";
import { config } from "../config.js";

let transporter;

function getTransporter() {
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass || !config.smtpFrom) {
    const error = new Error("SMTP configuration is incomplete");
    error.statusCode = 400;
    throw error;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    });
  }

  return transporter;
}

function buildMultilingualEmailText(recipientName, message) {
  if (typeof message === "string") {
    return message;
  }

  return [
    `Birthday wishes for ${recipientName}`,
    "",
    "English:",
    message.english,
    "",
    "Hindi:",
    message.hindi,
    "",
    "Hinglish:",
    message.hinglish
  ].join("\n");
}

export async function sendEmailDelivery({ recipientEmail, recipientName, message }) {
  if (!recipientEmail) {
    const error = new Error("recipientEmail is required for email delivery");
    error.statusCode = 400;
    throw error;
  }

  const transport = getTransporter();
  const info = await transport.sendMail({
    from: config.smtpFrom,
    to: recipientEmail,
    subject: `Birthday wish for ${recipientName}`,
    text: buildMultilingualEmailText(recipientName, message)
  });

  return {
    channel: "email",
    externalId: info.messageId || ""
  };
}
