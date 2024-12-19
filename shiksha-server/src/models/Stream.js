import mongoose from "mongoose";

const streamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Stream = mongoose.model("Stream", streamSchema);
export default Stream;
