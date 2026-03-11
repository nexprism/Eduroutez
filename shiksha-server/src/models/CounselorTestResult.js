import mongoose from "mongoose";

const counselorTestResultSchema = new mongoose.Schema(
    {
        counselorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Counselor",
            required: true,
        },
        questionSetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CounselorQuestionSet",
            required: true,
        },
        answers: [
            {
                questionId: mongoose.Schema.Types.ObjectId,
                selectedOptionId: mongoose.Schema.Types.ObjectId,
                isCorrect: Boolean,
            },
        ],
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            default: 50,
        },
        timeTaken: {
            type: Number, // in seconds
        },
        status: {
            type: String,
            enum: ["pass", "fail", "timed_out"],
            default: "fail",
        },
        adminVerified: {
            type: Boolean,
            default: false,
        },
        verifiedAt: {
            type: Date,
        },
        paymentId: {
            type: String, // from razorpay or other provider
        }
    },
    { timestamps: true }
);

const CounselorTestResult = mongoose.model(
    "CounselorTestResult",
    counselorTestResultSchema
);

export default CounselorTestResult;
