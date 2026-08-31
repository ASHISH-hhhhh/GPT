import rateLimit from "../services/rateLimit.js";
export const signUpLimiter = async (req, res, next) => {
  try {
    const redisKey = `signUpLimiter:${req.ip}`;
    const expiryTime = 60 * 10;
    const limit = 60;
    const rateLimitFunc = await rateLimit(redisKey, expiryTime, limit);
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

export const logInLimiter = async (req, res, next) => {
  try {
    const key = `logInLimiter:${req.ip}`;
    const expiryTime = 60 * 10;
    const limit = 10;
    const rateLimitFunc = await rateLimit(key, expiryTime, limit);
    if (rateLimitFunc.status === 0) {
      return res
        .status(429)
        .json({ message: `Too many request ${rateLimitFunc.tryAfter}` });
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
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const privateProfileLimiter = async (req, res, next) => {
  try {
    const key = `prpLimiter${req.payload.id}`;
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
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
