import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
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
      lowercase: true
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
    provider: {
      type: String,
      required: true
    },
    prompt: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
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
        delete ret._id;
        return ret;
      }
    }
  }
);

export const Message = mongoose.model("Message", messageSchema);
