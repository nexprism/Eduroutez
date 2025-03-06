import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

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
      // required: true,
    },
    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
    },
    level: {
      type: String,
    },
    status: {
      type: String,
      // required: true,
    },
    section: {
      type: String,
    },
  },
  { timestamps: true }
);

const Page = mongoose.model("Page", pageSchema);
applySoftDelete(pageSchema);
export default Page;
