import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: [
        {
            optionText: { type: String, required: true },
            isCorrect: { type: Boolean, default: false },
        },
    ],
    explanation: {
        type: String,
    },
});

const counselorQuestionSetSchema = new mongoose.Schema(
    {
        setName: {
            type: String,
            required: true,
            unique: true,
        },
        questions: [questionSchema],
        totalQuestions: {
            type: Number,
            default: 50,
        },
        timeLimit: {
            type: Number,
            default: 25, // in minutes
        },
    },
    { timestamps: true }
);

const CounselorQuestionSet = mongoose.model(
    "CounselorQuestionSet",
    counselorQuestionSetSchema
);

export default CounselorQuestionSet;
