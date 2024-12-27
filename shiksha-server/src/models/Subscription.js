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
        key: String,
        value: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    description: {
      type: String,
    },
    subscriptionType: {
      type: String,
      enum: ["POPULAR", "STANDARD", "PREMIUM"],
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
