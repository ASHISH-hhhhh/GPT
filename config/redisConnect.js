import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_CONNECTION_URI,
});
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});
redisClient.on("error", (error) => {
  console.log("Error in Redis :", error);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    return 1;
  } catch (error) {
    console.log("In redis connect catch", error);
    return 0;
  }
};

export default connectRedis;
