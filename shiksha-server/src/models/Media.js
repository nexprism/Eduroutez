import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    work: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    video: {
      type: String,
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", mediaSchema);
export default Media;
