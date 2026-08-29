import express from "express";
import authenticateUser from "../middlwares/authUser.js";
import {
  getRecentChats,
  getSingleChat,
  createChat,
  deleteSingleChat,
} from "../controllers/chatController/chatController.js";
import {
  rateLimitGetRC,
  rateLimitGetSC,
  rateLimitCreateChat,
} from "../middlwares/rateLimitChat.js";

const chatRouter = express.Router();

chatRouter.use(authenticateUser);

chatRouter.get("/getrecentchats", rateLimitGetRC, getRecentChats);
chatRouter.get("/getsinglechat/:chatid", rateLimitGetSC, getSingleChat);
chatRouter.post("/createchat", rateLimitCreateChat, createChat);
chatRouter.delete("/deletesinglechat/:chatid", deleteSingleChat);

export default chatRouter;
