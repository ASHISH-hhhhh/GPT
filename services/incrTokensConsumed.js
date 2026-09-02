import { redisClient } from "../config/redisConnect.js";

const incrTokensConsumed = async (key, tokenValue) => {
  return await redisClient.incrBy(key, tokenValue);
};
export default incrTokensConsumed;
