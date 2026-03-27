import mongoose from "mongoose";

const deliveryHistorySchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipientProfile",
      default: null,
      index: true
    },
    recipientName: {
      type: String,
      required: true,
      trim: true
    },
    deliveryChannel: {
      type: String,
      enum: ["in_app", "email"],
      required: true
    },
    status: {
      type: String,
      enum: ["sent", "failed", "skipped"],
      required: true
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledWish",
      default: null
    },
    destination: {
      type: String,
      default: ""
    },
    provider: {
      type: String,
      default: ""
    },
    externalId: {
      type: String,
      default: ""
    },
    errorMessage: {
      type: String,
      default: ""
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
        ret.recipientId = ret.recipientId ? ret.recipientId.toString() : null;
        ret.messageId = ret.messageId ? ret.messageId.toString() : null;
        ret.scheduleId = ret.scheduleId ? ret.scheduleId.toString() : null;
        delete ret._id;
        return ret;
      }
    }
  }
);

export const DeliveryHistory = mongoose.model("DeliveryHistory", deliveryHistorySchema);
