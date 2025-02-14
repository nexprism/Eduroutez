import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const courseCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCategory",
    },
    icon: {
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

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);
applySoftDelete(courseCategorySchema);

export default CourseCategory;
