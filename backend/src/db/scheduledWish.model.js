import mongoose from "mongoose";

const scheduledWishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    style: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    promptType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "universal"
    },
    age: {
      type: String,
      default: ""
    },
    interests: {
      type: [String],
      default: []
    },
    useLiveAi: {
      type: Boolean,
      default: false
    },
    deliveryChannel: {
      type: String,
      enum: ["in_app", "email", "sms", "whatsapp"],
      default: "in_app",
      required: true
    },
    recipientEmail: {
      type: String,
      default: ""
    },
    recipientPhone: {
      type: String,
      default: ""
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "failed", "skipped"],
      default: "pending"
    },
    deliveryExternalId: {
      type: String,
      default: ""
    },
    deliveredAt: Date,
    scheduledFor: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
      index: true
    },
    processedAt: Date,
    lastError: {
      type: String,
      default: ""
    },
    generatedMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        ret.scheduledFor = ret.scheduledFor.toISOString();
        ret.processedAt = ret.processedAt ? ret.processedAt.toISOString() : null;
        ret.deliveredAt = ret.deliveredAt ? ret.deliveredAt.toISOString() : null;
        ret.generatedMessageId = ret.generatedMessageId ? ret.generatedMessageId.toString() : null;
        delete ret._id;
        return ret;
      }
    }
  }
);

export const ScheduledWish = mongoose.model("ScheduledWish", scheduledWishSchema);
