import mongoose from "mongoose";

const connect = async (url) => {
  mongoose.set("strictQuery", false);
  mongoose.set("allowDiskUse", true);
  await mongoose.connect(url);
};
export { connect };
