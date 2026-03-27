import { Message } from "../db/message.model.js";

export async function saveMessage(message) {
  const saved = await Message.create(message);
  return saved.toJSON();
}

export async function listMessages(limit = 20) {
  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean(false);

  return messages.map((message) => message.toJSON());
}
