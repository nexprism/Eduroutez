import mongoose from "mongoose";

const reddemHistrySchema = new mongoose.Schema(
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
    points: {
      type: Number,
      required: true,
    },
    Date: {
      type: Date,
      default: Date.now,
    },
    remarks: {
        type: String,
        default: "Points Redeemed",
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "COMPLETED",
    },
  },
  { timestamps: true }
);

const ReddemHistry = mongoose.model("ReddemHistry", reddemHistrySchema);
export default ReddemHistry;
