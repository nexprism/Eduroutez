import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      required: true,
    },
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
    discount: {
      type: Number, // Percentage or fixed amount discount
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user (businessOwner) who created the coupon
      required: true,
    },
    redeemedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to users who have redeemed the coupon
      },
    ],
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Reference to the category associated with the coupon
      },
    ],
    couponType: {
      type: String,
      enum: ["POPULAR", "TRENDING"], // pop
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
