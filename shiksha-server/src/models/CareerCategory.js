import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

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
applySoftDelete(careerCategorySchema);
export default CareerCategory;
