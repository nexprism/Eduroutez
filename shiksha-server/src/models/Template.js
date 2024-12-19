import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
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

    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Reference to the category associated with the coupon
      },
    ],
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);
export default Template;
