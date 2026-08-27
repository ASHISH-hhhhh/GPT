import express from "express";
import {
  signup,
  login,
  logout,
  publicProfile,
  privateProfile,
  deleteProfile,
} from "../controllers/userController/userController.js";
import authenticateUser from "../middlwares/authUser.js";
const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.get("/publicprofile", authenticateUser, publicProfile);
userRouter.get("/privateprofile", authenticateUser, privateProfile);
userRouter.delete("/deleteaccount", authenticateUser, deleteProfile);
export default userRouter;
