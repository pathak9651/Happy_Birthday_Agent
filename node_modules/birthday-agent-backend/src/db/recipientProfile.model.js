import mongoose from "mongoose";

const recipientProfileSchema = new mongoose.Schema(
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
    favoriteStyle: {
      type: String,
      default: "funny",
      trim: true,
      lowercase: true
    },
    favoritePromptType: {
      type: String,
      default: "universal",
      trim: true,
      lowercase: true
    },
    interests: {
      type: [String],
      default: []
    },
    age: {
      type: String,
      default: ""
    },
    defaultDeliveryChannel: {
      type: String,
      enum: ["in_app", "email"],
      default: "in_app"
    },
    email: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    },
    lastMessageAt: Date,
    lastDeliveryAt: Date
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        ret.lastMessageAt = ret.lastMessageAt ? ret.lastMessageAt.toISOString() : null;
        ret.lastDeliveryAt = ret.lastDeliveryAt ? ret.lastDeliveryAt.toISOString() : null;
        delete ret._id;
        return ret;
      }
    }
  }
);

recipientProfileSchema.index({ name: 1, relationship: 1 }, { unique: true });

export const RecipientProfile = mongoose.model("RecipientProfile", recipientProfileSchema);
