import express from "express";
import authenticateUser from "../middlwares/authUser.js";
import {
  getChats,
  messageInContext,
} from "../controllers/messageController/messageController.js";
import {
  rateLimitMIC,
  rateLimitGetMessages,
} from "../middlwares/rateLimitMessage.js";

const messageRouter = express.Router();
messageRouter.use(authenticateUser);

messageRouter.get("/:chatId", rateLimitGetMessages, getChats);
messageRouter.post("/:chatId", rateLimitMIC, messageInContext);

export default messageRouter;
