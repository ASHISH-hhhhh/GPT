import UserModel from "../../model/userSchema.js";
import ChatModel from "../../model/chatSchema.js";
import MessageModel from "../../model/messageSchema.js";
import geminiResponse from "../../services/geminiResponse.js";
import incrTokensConsumed from "../../services/incrTokensConsumed.js";

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
            text: `Summarize the conversation above into persistent context for future conversations.

                   OUTPUT RULES:
                   1. Output ONLY the summary.
                   2. No introduction.
                   3. No conclusion.
                   4. No "Summary:", "Summary Response:", "Status:", or similar headings unless they contain actual contextual information.
                   5. No conversational language.
                   6. No explanation of the summarization process.
                   7. No mention of this prompt.
                   8. Do not address the user.
                   9. Keep it concise and information-dense.
                  10. Include only information that could be useful in future conversations.
                  11. Preserve important user preferences, instructions, projects, decisions, and technical context.
                  12. Remember: future responses should be short, crisp, and to the point.

                  Use concise bullet points or sections.`,
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
    const redisFiveHourTokenKey = `userId${req.payload.id}5hour`;
    const tokensUsed = await incrTokensConsumed(
      redisFiveHourTokenKey,
      llmResponse.totalPromptResponseTokenCount,
    );
    console.log("Total tokens consumed in Messsage:", tokensUsed);
    const updatedUserProfile = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          // "usage.tokenFiveHourUsed": llmResponse.totalPromptResponseTokenCount,
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
