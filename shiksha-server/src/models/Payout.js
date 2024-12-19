import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType", // Dynamic reference based on userType field
    },
    userType: {
      type: String,
      required: true,
      enum: ["STUDENT", "COUNSELOR"],
    },

    requestedAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "PENDING",
    },
    status: {
      type: String,
      enum: ["REQUESTED", "UNPAID", "REJECTED", "PAID"],
      default: "REQUESTED",
    },
  },
  { timestamps: true }
);

const Payout = mongoose.model("Payout", payoutSchema);
export default Payout;
