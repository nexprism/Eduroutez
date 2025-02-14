import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const instituteInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const InstituteInquiry = mongoose.model("InstituteInquiry", instituteInquirySchema);
applySoftDelete(instituteInquirySchema);
export default InstituteInquiry;
