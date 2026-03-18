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
    isCourseStream: {
      type: Boolean,
      default: false,
    },
    isCounsellorStream: {
      type: Boolean,
      default: false,
    },
    isBoth: {
      type: Boolean,
      default: false,
    },
    isCollege: {
      type: Boolean,
      default: false,
    },
    isInstitute: {
      type: Boolean,
      default: false,
    },
    isUniversity: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Stream = mongoose.model("Stream", streamSchema);
applySoftDelete(streamSchema);
export default Stream;
