import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

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
applySoftDelete(streamSchema);
export default Stream;
