import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

const Career = mongoose.model("Career", careerSchema);
export default Career;
