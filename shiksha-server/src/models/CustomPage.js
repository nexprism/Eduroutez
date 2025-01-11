import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    //   required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status:{
        type: Boolean,
        required: true,
    },
    section: {
        type: String,
        required: true,
      },
  },
  { timestamps: true }
);

const Page = mongoose.model("Page", pageSchema);
export default Page;
