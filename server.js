import express from "express";
import "dotenv/config";
import connectDB from "./config/databaseConnect.js";
import connectRedis from "./config/redisConnect.js";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import messageRouter from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);

const connectDbPort = async () => {
  try {
    const resMongo = await connectDB();
    const resRedis = await connectRedis();
    if (resMongo && resRedis) {
      app.listen(process.env.PORT, () => {
        console.log(`Listening on port number ${process.env.PORT}`);
      });
    } else {
      console.log("Failed to connect to DB/Internal server error");
    }
  } catch (error) {
    console.log(error.message);
  }
};
await connectDbPort();
