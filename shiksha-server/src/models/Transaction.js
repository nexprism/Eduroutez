import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who made the transaction
      required: true,
    },
    // coupon: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Coupon", // Reference to the coupon associated with the transaction
    //   required: true,
    // },
    amount: {
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
