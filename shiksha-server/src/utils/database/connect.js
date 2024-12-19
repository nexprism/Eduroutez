import mongoose from "mongoose";

const connect = async (url) => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(url);
};
export { connect };
