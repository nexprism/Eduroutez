import mongoose from "mongoose";

const careerCategorySchema = new mongoose.Schema(
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

const CareerCategory = mongoose.model("CareerCategory", careerCategorySchema);
export default CareerCategory;
