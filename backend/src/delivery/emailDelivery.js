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

function normalizeEmailError(error) {
  if (error.code === "EAUTH") {
    const authError = new Error("SMTP authentication failed. Check SMTP_USER and SMTP_PASS.");
    authError.statusCode = 502;
    return authError;
  }

  if (error.code === "ESOCKET" || error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
    const connectionError = new Error("SMTP connection failed. Check SMTP_HOST, SMTP_PORT, and SMTP_SECURE.");
    connectionError.statusCode = 502;
    return connectionError;
  }

  if (error.code === "EENVELOPE") {
    const recipientError = new Error("SMTP rejected the recipient email address.");
    recipientError.statusCode = 400;
    return recipientError;
  }

  const fallbackError = new Error(error.message || "Email delivery failed");
  fallbackError.statusCode = error.statusCode || 502;
  return fallbackError;
}

export async function sendEmailDelivery({ recipientEmail, recipientName, message }) {
  if (!recipientEmail) {
    const error = new Error("recipientEmail is required for email delivery");
    error.statusCode = 400;
    throw error;
  }

  const transport = getTransporter();
  let info;

  try {
    info = await transport.sendMail({
      from: config.smtpFrom,
      to: recipientEmail,
      subject: `Birthday wish for ${recipientName}`,
      text: buildMultilingualEmailText(recipientName, message)
    });
  } catch (error) {
    throw normalizeEmailError(error);
  }

  return {
    channel: "email",
    externalId: info.messageId || ""
  };
}
