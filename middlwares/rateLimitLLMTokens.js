import { redisClient } from "../config/redisConnect.js";

export const rateLimitCreateChatTokens = async (req, res, next) => {
  try {
    const redisFiveHourTokenKey = `userId${req.payload.id}5hour`;
    const exists = await redisClient.exists(redisFiveHourTokenKey);

    if (!exists) {
      await redisClient.set(redisFiveHourTokenKey, 0);
      await redisClient.expire(
        redisFiveHourTokenKey,
        Number(process.env.FIVE_HOUR_LIMIT_TIME_WINDOW),
      );
    }

    const getTokensUsedUnderFiveHourLimit = Number(
      await redisClient.get(redisFiveHourTokenKey),
    );

    if (
      getTokensUsedUnderFiveHourLimit >=
      Number(process.env.TOKEN_FIVE_HOUR_LIMIT)
    ) {
      const ttl = await redisClient.ttl(redisFiveHourTokenKey);
      return res.status(422).json({
        message: `You have used your Five hour window token limit . Please come back at ${new Date(Date.now() + ttl * 1000).toLocaleString("en-IN")}`,
      });
    }
    next();
  } catch (error) {
    console.log("In rateLimitCreateChatTokens function catch block:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
