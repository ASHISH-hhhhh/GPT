import rateLimit from "../services/rateLimit.js";

export const rateLimitGetRC = async (req, res, next) => {
  try {
    const key = `rateLimitGetRC${req.payload.id}`;
    const expiryTime = 60;
    const limit = 100;
    const rateLimitFunc = await rateLimit(key, expiryTime, limit);

    if (rateLimitFunc.status === 0) {
      return res.status(429).json({
        message: `Too many request | Please try after ${rateLimitFunc.tryAfter}`,
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
    const expiryTime = 60;
    const limit = 100;
    const rateLimitFunc = await rateLimit(key, expiryTime, limit);

    if (rateLimitFunc.status === 0) {
      return res.status(429).json({
        message: `Too many request | Please try after ${rateLimitFunc.tryAfter}`,
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
    const expiryTime = 60 * 60;
    const limit = 20;
    const rateLimitFunc = await rateLimit(key, expiryTime, limit);

    if (rateLimitFunc.status === 0) {
      return res.status(429).json({
        message: `Too many request | Please again after ${rateLimitFunc.tryAfter}`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
