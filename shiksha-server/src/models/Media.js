import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
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
