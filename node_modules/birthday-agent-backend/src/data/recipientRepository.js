import { RecipientProfile } from "../db/recipientProfile.model.js";

export async function upsertRecipientProfile(input) {
  const updated = await RecipientProfile.findOneAndUpdate(
    {
      name: input.name,
      relationship: input.relationship
    },
    {
      $set: {
        favoriteStyle: input.style,
        favoritePromptType: input.promptType,
        interests: input.interests,
        age: input.age,
        defaultDeliveryChannel: input.deliveryChannel || "in_app",
        email: input.recipientEmail || "",
        notes: input.notes || ""
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  return updated;
}

export async function listRecipientProfiles(limit = 50) {
  const recipients = await RecipientProfile.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean(false);

  return recipients.map((recipient) => recipient.toJSON());
}

export async function markRecipientMessageActivity(recipientId, timestamp = new Date()) {
  if (!recipientId) {
    return null;
  }

  const updated = await RecipientProfile.findByIdAndUpdate(
    recipientId,
    {
      lastMessageAt: timestamp
    },
    { new: true }
  );

  return updated?.toJSON() || null;
}

export async function markRecipientDeliveryActivity(recipientId, timestamp = new Date()) {
  if (!recipientId) {
    return null;
  }

  const updated = await RecipientProfile.findByIdAndUpdate(
    recipientId,
    {
      lastDeliveryAt: timestamp
    },
    { new: true }
  );

  return updated?.toJSON() || null;
}
