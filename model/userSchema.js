import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: 2,
      maxLenngth: 30,
      required: true,
    },
    age: {
      type: Number,
      min: 12,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
    },
    usage: {
      // tokenFiveHourUsed: {
      //   type: Number,
      //   default: 0,
      // },
      // tokenFiveHourLimit: {
      //   type: Number,
      //   default: 10000,
      // },
      // resetAt: {
      //   type: Date,
      //   default: () => new Date(Date.now() + 5 * 60 * 60 * 1000),
      // },
      totalTokensUsedOverAll: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true },
);
const UserModel = mongoose.model("user", userSchema);
export default UserModel;
