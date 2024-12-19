import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
export default PaymentMethod;
