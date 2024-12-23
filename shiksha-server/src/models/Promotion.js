import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
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
    },
    status: {
      type: String,
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;
