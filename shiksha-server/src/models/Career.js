import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js"; 
const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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
      type: String,
    },
    eligibility: {
      type: String,
      // required: true,
    },
    jobRoles: {
      type: String,
      // required: true,
    },
    opportunity: {
      type: String,
      // required: true,
    },
    topColleges: {
      type: String,
      // required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
  },
  { timestamps: true }
);

const Career = mongoose.model("Career", careerSchema);
applySoftDelete(careerSchema);
export default Career;

