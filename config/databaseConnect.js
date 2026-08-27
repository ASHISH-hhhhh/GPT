import mongoose from "mongoose";

const connectDB = async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    return 1;
  } catch (error) {
    console.log(error.message);
    return 0;
  }
};
export default connectDB;
