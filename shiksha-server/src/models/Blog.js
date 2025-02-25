import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
    image: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "BlogCategory", // Reference to the category associated with the coupon
      type:String
    },
    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
    },
    likes: [
      {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
    metaImage: {
      type: String,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
applySoftDelete(blogSchema);
export default Blog;
