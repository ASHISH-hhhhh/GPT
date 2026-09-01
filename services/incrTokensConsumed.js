import { redisClient } from "../config/redisConnect.js";

const incrTokensConsumed = async (key, tokenValue) => {
  await redisClient.incr(key, tokenValue);
};
export default incrTokensConsumed;
