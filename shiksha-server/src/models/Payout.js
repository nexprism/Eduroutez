import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const payoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
    transactionId: {
      type: String,
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
applySoftDelete(payoutSchema);
export default Payout;
