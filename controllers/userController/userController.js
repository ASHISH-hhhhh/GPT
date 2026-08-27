import jwt from "jsonwebtoken";
import UserModel from "../../model/userSchema.js";
import MessageModel from "../../model/messageSchema.js";
import ChatModel from "../../model/chatSchema.js";
import bcrypt from "bcrypt";
import {
  userSignUpValidator,
  userLogInValidator,
} from "../../validators/userValidator.js";
import blockJWTToken from "../../services/blockJWTToken.js";
import { redisClient } from "../../config/redisConnect.js";

export const signup = async (req, res) => {
  try {
    const result = userSignUpValidator.safeParse(req.body);
    if (result.success === false) {
      console.log(result);
      return res.status(422).json({ message: result.error.issues[0].message });
    }
    const { name, email, age, password } = result.data;
    const isUser = await UserModel.findOne({ email });
    if (isUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashedPass = await bcrypt.hash(String(password), 10);
    const createdUser = await UserModel.create({
      name,
      email,
      age,
      password: hashedPass,
    });
    const token = jwt.sign(
      { email: createdUser.email, id: createdUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "User created 😁" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: `Internal server error  🌋` });
  }
};
export const login = async (req, res) => {
  try {
    const result = userLogInValidator.safeParse(req.body);
    if (result.success === false) {
      return res.status(422).json({ message: result.error.issues[0].message });
    }
    const { password, email } = result.data;
    const user = await UserModel.findOne({ email });
    if (user === null) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const isVerified = await bcrypt.compare(password, user.password);
    if (!isVerified) {
      return res.status(403).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "User Logged in 😀",
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = async (req, res) => {
  try {
    const verifiedToken = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    if (!verifiedToken) {
      return res
        .status(422)
        .json({ message: "Not  a valid jwt token to logout" });
    }

    blockJWTToken(req.cookies.token, verifiedToken);

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
    });
    res.status(201).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("In logout controller catch", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const publicProfile = async (req, res) => {
  try {
    const { id } = req.payload;
    const userPublicProfile = await UserModel.findOne({ _id: id }).select(
      "name age email usage",
    );
    if (!userPublicProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(userPublicProfile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const privateProfile = async (req, res) => {
  try {
    const { email } = req.payload;
    const userProfile = await UserModel.findOne({ email });
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteProfile = async (req, res) => {
  try {
    const isBlocked = await redisClient.exists(
      `blockedJWT${req.cookies.token}`,
    );
    if (isBlocked) {
      return res.status(401).json({ message: "Token is invalid" });
    }
    const { id } = req.payload;
    const isUser = await UserModel.findOne({ _id: id });
    if (isUser === null) {
      return res.status(404).json({ message: "User not found" });
    }
    const delMessages = await MessageModel.deleteMany({ userId: id });
    if (!delMessages.acknowledged) {
      return res
        .status(422)
        .json({ message: `Failed to delete messages related to ${id}` });
    }
    const delChats = await ChatModel.deleteMany({ userId: id });
    if (!delChats.acknowledged) {
      return res
        .status(422)
        .json({ message: `Failed to delete chats realted to ${id}` });
    }
    const delUser = await UserModel.findOneAndDelete({ _id: id });
    if (delUser === null) {
      return res
        .status(422)
        .json({ message: `Failed to delete user account with id ${id}` });
    }
    res.status(200).json({
      message: "Deleted messages , chats and user account",
      messagesDeleted: delMessages.deletedCount,
      chatsDeleted: delChats.deletedCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
