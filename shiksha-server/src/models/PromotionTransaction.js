import mongoose from "mongoose";

const promotionTransactionSchema = new mongoose.Schema(
    {
        promotionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Promotion", // Reference to the promotion
            required: true,
        },
        instituteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute", // Reference to the institute
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        transactionDate: {
            type: Date,
            default: Date.now,
        },
        remarks: {
            type: String,
        },
        paymentId: {
            type: String,
        },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
    },
    { timestamps: true }
);

const PromotionTransaction = mongoose.model("PromotionTransaction", promotionTransactionSchema);
export default PromotionTransaction;
