import ChatModel from "../../model/chatSchema.js";
import MessageModel from "../../model/messageSchema.js";
import UserModel from "../../model/userSchema.js";
import geminiResponse from "../../services/geminiResponse.js";
import incrTokensConsumed from "../../services/incrTokensConsumed.js";

export const getRecentChats = async (req, res) => {
  try {
    const { id } = req.payload;
    const isUser = await UserModel.findOne({ _id: id });
    if (!isUser) {
      return res
        .status(404)
        .json({ message: "user not found please sign up for account" });
    }
    const chats = await ChatModel.find({ userId: id })
      .sort({ updatedAt: -1 })
      .limit(20);
    console.log(isUser, chats);
    if (chats.length <= 0) {
      return res.status(404).json({ message: "No chats found" });
    }
    res.json({ message: `Here are the recent ${chats.length} chats`, chats });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
export const getSingleChat = async (req, res) => {
  try {
    const { id } = req.payload;
    const { chatid } = req.params;
    const isUser = await UserModel.findOne({ _id: id });
    if (!isUser) {
      return res
        .status(404)
        .json({ message: "User not found please sign up for account" });
    }
    const singleChat = await ChatModel.findOne({ userId: id, _id: chatid });
    if (!singleChat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.json({ message: singleChat });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
export const createChat = async (req, res) => {
  try {
    const { id } = req.payload;
    const findUser = await UserModel.findOne({ _id: id });
    if (!findUser) {
      return res.status(404).json({ message: "User not found with this ID " });
    }

    const { prompt } = req.body;
    if (prompt.trim().length === 0) {
      return res.status(422).json({ message: "Please enter the prompt" });
    }
    const firstPrompt = [{ role: "user", parts: [{ text: prompt }] }];
    const responseGemini = await geminiResponse(false, firstPrompt);
    if (responseGemini.status === 0) {
      return res.status(500).json({ message: responseGemini.message });
    }
    const createdChat = await ChatModel.create({
      userId: id,
      topic: prompt.trim(),
      model: responseGemini.modelUsed,
      reqResNumber: 1,
      tokenInfo: {
        totalTokensUsed: responseGemini.totalPromptResponseTokenCount,
        requestToken: responseGemini.promptToken,
        resposneToken: responseGemini.responseToken,
      },
    });
    const createdMessage = await MessageModel.create({
      userId: id,
      chatId: createdChat._id,
      // req: prompt.trim(),
      // res: responseGemini.message,
      reqResArr: [
        { role: "user", parts: [{ text: prompt.trim() }] },
        { role: "model", parts: [{ text: responseGemini.message }] },
      ],
      tokenInfo: {
        reqResTokens: responseGemini.totalPromptResponseTokenCount,
        reqTokens: responseGemini.promptToken,
        resTokens: responseGemini.responseToken,
      },
    });

    const redisFiveHourTokenKey = `userId${req.payload.id}5hour`;
    await incrTokensConsumed(
      redisFiveHourTokenKey,
      responseGemini.totalPromptResponseTokenCount,
    );

    findUser.usage.totalTokensUsedOverAll =
      findUser.usage.totalTokensUsedOverAll +
      responseGemini.totalPromptResponseTokenCount;
    console.log("Before saving User Document:", findUser);
    await findUser.save();
    console.log("after saving User Document:", findUser);
    res.status(200).json({
      message: `Chat initiated with id ${createdChat._id} please use this chat id for further usage in this chat `,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
export const deleteSingleChat = async (req, res) => {
  try {
    const { chatid } = req.params;
    const { id } = req.payload;
    const isUser = await UserModel.findOne({ _id: id });
    if (!isUser) {
      return res
        .status(404)
        .json({ message: "User not found please sign up for account" });
    }
    const delChat = await ChatModel.findOneAndDelete({
      userId: id,
      _id: chatid,
    });
    if (delChat === null) {
      return res.status(422).json({ message: "chat with chatid not found" });
    }
    const delMessage = await MessageModel.deleteMany({
      userId: id,
      chatId: chatid,
    });
    if (!delMessage.acknowledged) {
      return res.status(422).json({
        message: `Failed to delete the messages with chat id :${chatid}`,
      });
    }
    res.json({
      message: `Deleted the below chat and all it's messages`,
      deletedChat: delChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
