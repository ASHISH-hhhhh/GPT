import { redisClient } from "../config/redisConnect.js";

export const rateLimitGetRC = async (req, res, next) => {
  try {
    const key = `rateLimitGetRC${req.payload.id}`;
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, 60);
    }
    if (count > 100) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        message: `Too many request please try after ${new Date(
          Date.now() + ttl * 1000,
        ).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const rateLimitGetSC = async (req, res, next) => {
  try {
    const key = `rateLimitGetSC${req.payload.id}`;
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, 60);
    }
    if (count > 100) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        message: `Too many request please try after ${new Date(
          Date.now() + ttl * 1000,
        ).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const rateLimitCreateChat = async (req, res, next) => {
  try {
    const key = `rateLimitCreateChat${req.payload.id}`;
    const count = await redisClient.incr(key);
    console.log("Count creating chat for id :", req.payload.id, count);
    if (count === 1) {
      await redisClient.expire(key, 60 * 60);
    }
    if (count > 20) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        message: `Too many request please try after. Only 20 chats are allowed to create per hour ${new Date(
          Date.now() + ttl * 1000,
        ).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
