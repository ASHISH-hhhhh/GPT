import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reqResArr: [
      {
        _id: false,
        role: {
          type: String,
          enum: ["user", "model"],
          required: true,
        },
        parts: [
          {
            _id: false,
            text: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    tokenInfo: {
      reqTokens: {
        type: Number,
        default: 0,
      },
      resTokens: {
        type: Number,
        default: 0,
      },
      reqResTokens: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true },
);
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });
const MessageModel = mongoose.model("message", messageSchema);
export default MessageModel;
