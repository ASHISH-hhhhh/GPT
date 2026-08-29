import { redisClient } from "../config/redisConnect.js";

export const signUpLimiter = async (req, res, next) => {
  try {
    const redisKey = `signUpLimiter:${req.ip}`;
    const count = await redisClient.incr(redisKey);
    if (count === 1) {
      await redisClient.expire(redisKey, 60 * 10);
    }
    if (count > 60) {
      const ttl = await redisClient.ttl(redisKey);
      return res.status(429).json({
        message: `Too many request . Please try after ${new Date(Date.now() + ttl * 1000).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logInLimiter = async (req, res, next) => {
  try {
    const key = `logInLimiter:${req.ip}`;
    const keyCount = await redisClient.incr(key);
    console.log("Login count for IP:", req.ip, keyCount);
    if (keyCount === 1) {
      await redisClient.expire(key, 60 * 10);
    }
    if (keyCount > 10) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        message: `Too many request . Please try after ${new Date(Date.now() + ttl * 1000).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error");
  }
};

export const publicProfileLimiter = async (req, res, next) => {
  try {
    const key = `pupLimiter${req.payload.id}`;
    const pupCounter = await redisClient.incr(key);
    if (pupCounter === 1) {
      await redisClient.expire(key, 60);
    }
    if (pupCounter > 100) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        message: `Too many request | Please try after ${new Date(Date.now() + ttl * 1000).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const privateProfileLimiter = async (req, res, next) => {
  try {
    const key = `prpLimiter${req.payload.id}`;
    const prpCounter = await redisClient.incr(key);
    if (prpCounter === 1) {
      await redisClient.expire(key, 60);
    }
    if (prpCounter > 100) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        message: `Too many request | Please try after ${new Date(Date.now() + ttl * 1000).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
