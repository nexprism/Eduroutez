import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    durationType: {
      type: String,
      enum: ["month", "year"],
      required: true,
    },
    features: [
      {
        fName: String,
        fValue: String,
      },
    ],
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
