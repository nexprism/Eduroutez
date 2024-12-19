import mongoose from "mongoose";

const careerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    eligibility: {
      type: String,
      required: true,
    },
    typesOfJobRoles: {
      type: String,
    },
    payScaleSalary: {
      type: String,
    },
    careerOpportunities: {
      type: String,
    },
    topColleges: {
      type: String,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const Career = mongoose.model("Career", careerSchema);
export default Career;
