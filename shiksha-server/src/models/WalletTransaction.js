import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the user who made the transaction
            required: true,
        },
        type: {
            type: String,
            enum: ["CREDIT", "DEBIT"],
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

const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);
export default WalletTransaction;
