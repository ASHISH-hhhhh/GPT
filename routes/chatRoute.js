import express from "express";
import authenticateUser from "../middlwares/authUser.js";
import {
  getRecentChats,
  getSingleChat,
  createChat,
  deleteSingleChat,
} from "../controllers/chatController/chatController.js";

const chatRouter = express.Router();

chatRouter.use(authenticateUser);

chatRouter.get("/getrecentchats", getRecentChats);
chatRouter.get("/getsinglechat/:chatid", getSingleChat);
chatRouter.post("/createchat", createChat);
chatRouter.delete("/deletesinglechat/:chatid", deleteSingleChat);

export default chatRouter;
