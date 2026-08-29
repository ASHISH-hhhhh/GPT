import jwt from "jsonwebtoken";
import { redisClient } from "../config/redisConnect.js";

const authenticateUser = async (req, res, next) => {
  try {
    const isTokenBlocked = await redisClient.exists(
      `blockedJWT${req.cookies.token}`,
    );
    if (isTokenBlocked) {
      return res
        .status(401)
        .json({ message: "Invalid token please login again" });
    }
    const payload = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    console.log("Here:", payload);
    console.log("JWT TOKEN:", req.cookies.token);
    if (!payload) {
      return res.status(401).json({ message: "In valid token credentials" });
    }
    req.payload = payload;
    next();
  } catch (error) {
    console.log("In authUser.js", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export default authenticateUser;
