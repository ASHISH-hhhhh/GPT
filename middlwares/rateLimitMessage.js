import { redisClient } from "../config/redisConnect.js";

export const rateLimitGetMessages = async (req, res, next) => {
  try {
    const key = `rateLimitGetMessages${req.payload.id}`;
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, 60);
    }
    if (count > 100) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        message: `Too many request only 100 request allowed per minute | please try try again after ${new Date(Date.now() + ttl * 1000).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    consoel.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rateLimitMIC = async (req, res, next) => {
  try {
    const key = `rateLimitMIC${req.payload.id}`;
    const count = await redisClient.incr(key);
    console.log("Count for MIC", count);
    if (count === 1) {
      await redisClient.expire(key, 60 * 60);
    }
    if (count > 20) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        message: `Too many request | Please try again after ${new Date(Date.now() + ttl * 1000).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
