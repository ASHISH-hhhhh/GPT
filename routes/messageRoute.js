import express from "express";
import authenticateUser from "../middlwares/authUser.js";
import {
  getChats,
  messageInContext,
} from "../controllers/messageController/messageController.js";

const messageRouter = express.Router();
messageRouter.use(authenticateUser);

messageRouter.get("/:chatId", getChats);
messageRouter.post("/:chatId", messageInContext);

export default messageRouter;
