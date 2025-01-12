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
        type: String,
        required: true,
    },
    section: {
        type: String,
      },
  },
  { timestamps: true }
);

const Page = mongoose.model("Page", pageSchema);
export default Page;
