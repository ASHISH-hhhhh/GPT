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
import {
  signUpLimiter,
  logInLimiter,
  publicProfileLimiter,
  privateProfileLimiter,
} from "../middlwares/rateLimitUser.js";
const userRouter = express.Router();

userRouter.post("/signup", signUpLimiter, signup);
userRouter.post("/login", logInLimiter, login);
userRouter.post("/logout", logout);
userRouter.get(
  "/publicprofile",
  authenticateUser,
  publicProfileLimiter,
  publicProfile,
);
userRouter.get(
  "/privateprofile",
  authenticateUser,
  privateProfileLimiter,
  privateProfile,
);
userRouter.delete("/deleteaccount", authenticateUser, deleteProfile);
export default userRouter;
