import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    topic: {
      type: String,
      minLength: 1,
      default: "New chat",
    },
    model: {
      type: String,
      required: true,
    },
    reqResNumber: {
      type: Number,
      default: 0,
    },
    summaryInfo: {
      summary: {
        type: String,
        // required: true,
        default: "",
      },
      summaryTillReqRes: {
        type: Number,
        default: null,
      },
      summaryUpdatedAt: {
        type: Date,
        default: null,
      },
    },
    tokenInfo: {
      totalTokensUsed: {
        type: Number,
        default: 0,
      },
      requestToken: {
        type: Number,
        default: 0,
      },
      resposneToken: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true },
);

chatSchema.index({ userId: 1, updatedAt: -1 });
const ChatModel = mongoose.model("chat", chatSchema);
export default ChatModel;
