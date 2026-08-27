import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/databaseConnect.js";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import messageRouter from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);

const connectDbPort = async () => {
  try {
    const res = await connectDB();
    if (res) {
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
connectDbPort();
