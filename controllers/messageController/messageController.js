import UserModel from "../../model/userSchema.js";
import ChatModel from "../../model/chatSchema.js";
import MessageModel from "../../model/messageSchema.js";
import geminiResponse from "../../services/geminiResponse.js";

export const messageInContext = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { id } = req.payload;
    const contextForGemini = [];
    const { prompt } = req.body;
    let llmResponse = null;
    if (prompt.trim().length <= 0) {
      return res.status(422).json({ message: "Please enter valid prompt" });
    }
    const isUser = await UserModel.findOne({ _id: id });
    if (!isUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (Date.now() > isUser.usage.resetAt) {
      isUser.usage.tokenFiveHourUsed = 0;
      isUser.usage.resetAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
      await isUser.save();
    }
    if (isUser.usage.tokenFiveHourUsed >= isUser.usage.tokenFiveHourLimit) {
      return res.status(422).json({
        message: `You have used your Five hour window token limit . Please come back at ${isUser.usage.resetAt.toLocaleString("en-IN")}`,
      });
    }

    const chat = await ChatModel.findOne({ userId: id, _id: chatId });
    if (!chat) {
      return res
        .status(404)
        .json({ message: `Chat with id ${chatId} not found` });
    }
    const messages = await MessageModel.find({
      userId: id,
      chatId: chatId,
    })
      .sort({ createdAt: 1 })
      .select("reqResArr tokenInfo createdAt -_id")
      .lean();
    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }
    if (chat.summaryInfo.summaryTillReqRes >= 10) {
      const slicedMsgDoc = messages.slice(
        chat.summaryInfo.summaryTillReqRes - 1,
      );
      for (let msgDoc of slicedMsgDoc) {
        contextForGemini.push(...msgDoc.reqResArr);
      }
      contextForGemini.push({ role: "user", parts: [{ text: prompt.trim() }] });
      console.log(
        "Here 1:summaryTillReqRes >= 10| After appending user request",
        contextForGemini,
      );
      llmResponse = await geminiResponse(
        chat.summaryInfo.summary,
        contextForGemini,
      );
      console.log("Here 3:", llmResponse);
    } else {
      for (let reqRes of messages) {
        contextForGemini.push(...reqRes.reqResArr);
      }
      contextForGemini.push({
        role: "user",
        parts: [{ text: prompt.trim() }],
      });
      llmResponse = await geminiResponse(false, contextForGemini);
    }

    if (llmResponse.status === 0) {
      return res.status(500).json({ message: llmResponse.message });
    }
    const createdMessage = await MessageModel.create({
      userId: id,
      chatId: chatId,
      reqResArr: [
        contextForGemini.at(-1),
        { role: "model", parts: [{ text: llmResponse.message }] },
      ],
      tokenInfo: {
        reqResTokens: llmResponse.totalPromptResponseTokenCount,
        reqTokens: llmResponse.promptToken,
        resTokens: llmResponse.responseToken,
      },
    });
    contextForGemini.push({
      role: "model",
      parts: [{ text: llmResponse.message }],
    });
    messages.push(createdMessage);
    for (let singleReqRes of contextForGemini) {
      console.log(singleReqRes.role, singleReqRes.parts[0]);
    }
    console.log(
      "Messages not context:",
      messages,
      "Messages length:",
      messages.length,
      "contextForGemini Length:",
      contextForGemini.length,
    );
    if (messages.length % 10 === 0) {
      const contextForSummaryGemini = [];
      for (let mesgDoc of messages) {
        contextForSummaryGemini.push(...mesgDoc.reqResArr);
      }
      contextForSummaryGemini.push({
        role: "user",
        parts: [
          {
            text: "Please create a summary for all the above chats . Iam creating this summary for you only so you get proper context .Otherwise i have to send every message which increases token consumption right. So just give me the summary in response i will store it directly in my DB okay include in summary that responses should be short and crisp to the point",
          },
        ],
      });
      console.log(
        "Here in %10 section :",
        contextForSummaryGemini,
        contextForSummaryGemini.length,
      );
      const summaryResponse = await geminiResponse(
        false,
        contextForSummaryGemini,
      );
      if (summaryResponse.status) {
        console.log("Summary Response:", summaryResponse.message);
        try {
          const chatSummaryToBeUpdated = await ChatModel.findOneAndUpdate(
            { userId: id, _id: chatId },
            {
              $set: {
                "summaryInfo.summary": summaryResponse.message,
                "summaryInfo.summaryTillReqRes": messages.length,
                "summaryInfo.summaryUpdatedAt": Date.now(),
              },
            },
            { runValidators: true, new: true },
          );
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("Summary not created");
      }
    }

    const updatedChat = await ChatModel.findOneAndUpdate(
      {
        _id: chatId,
        userId: id,
      },
      {
        $set: { reqResNumber: messages.length },
        $inc: {
          "tokenInfo.totalTokensUsed":
            llmResponse.totalPromptResponseTokenCount,

          "tokenInfo.requestToken": llmResponse.promptToken,
          "tokenInfo.resposneToken": llmResponse.responseToken,
        },
      },
      {
        runValidators: true,
        new: true,
      },
    );
    const updatedUserProfile = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          "usage.tokenFiveHourUsed": llmResponse.totalPromptResponseTokenCount,
          "usage.totalTokensUsedOverAll":
            llmResponse.totalPromptResponseTokenCount,
        },
      },
      { runValidators: true, new: true },
    );

    res.status(200).json({ chatId, contextForGemini });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getChats = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { id } = req.payload;
    const isUser = await UserModel.findOne({ _id: id });
    if (!isUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const chat = await ChatModel.findOne({ _id: chatId, userId: id });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    const messages = await MessageModel.find({ userId: id, chatId: chatId })
      .sort({ createdAt: 1 })
      .select("reqResArr tokenInfo createdAt -_id");
    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }
    console.log(messages, messages.length);
    return res.json({ user: isUser, messages: messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error " });
  }
};
