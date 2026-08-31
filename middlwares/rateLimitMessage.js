import rateLimit from "../services/rateLimit.js";

export const rateLimitGetMessages = async (req, res, next) => {
  try {
    const key = `rateLimitGetMessages${req.payload.id}`;
    const expiryTime = 60;
    const limit = 100;
    const rateLimitFunc = await rateLimit(key, expiryTime, limit);
    if (rateLimitFunc.status === 0) {
      return res
        .status(429)
        .json({ message: `Too many request ${rateLimitFunc.tryAfter}` });
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
    const expiryTime = 60 * 60;
    const limit = 20;
    const rateLimitFunc = await rateLimit(key, expiryTime, limit);
    if (rateLimitFunc.status === 0) {
      return res
        .status(429)
        .json({ message: `Too many request ${rateLimitFunc.tryAfter}` });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
