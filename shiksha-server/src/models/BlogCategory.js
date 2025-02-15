import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";
const blogCategorySchema = new mongoose.Schema(
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

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
applySoftDelete(blogCategorySchema);
export default BlogCategory;
