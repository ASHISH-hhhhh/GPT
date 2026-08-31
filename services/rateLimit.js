import { redisClient } from "../config/redisConnect.js";

const rateLimit = async (key, expiryTime, limit) => {
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.expire(key, expiryTime);
  }
  if (count > limit) {
    const ttl = await redisClient.ttl(key);
    const tryAfter = new Date(Date.now() + ttl * 1000).toLocaleString("en-IN");
    return { status: 0, tryAfter };
  }
  return { status: 1 };
};

export default rateLimit;
