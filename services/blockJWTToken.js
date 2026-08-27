import { redisClient } from "../config/redisConnect.js";

const blockJWTToken = async (token, verifiedToken) => {
  await redisClient.set(`blockedJWT${token}`, token);
  await redisClient.expire(
    `blockedJWT${token}`,
    Math.round(verifiedToken.exp - Date.now() / 1000),
  );
};
export default blockJWTToken;
