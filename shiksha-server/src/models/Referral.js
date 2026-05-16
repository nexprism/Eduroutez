import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
    {
        referrer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        referred: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        webinar: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Webinar",
            required: true,
        },
        amount: {
            type: Number,
            default: 1, // Referrer earns ₹1
        },
        status: {
            type: String,
            enum: ["PENDING", "ATTENDED", "EARNED", "REDEEMED"],
            default: "PENDING",
        },
    },
    { timestamps: true }
);

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;
