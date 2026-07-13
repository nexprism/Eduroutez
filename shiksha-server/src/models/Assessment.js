import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const optionSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        dimension: {
            type: String,
            required: true,
            enum: [
                "Analytical",
                "Creative",
                "Social",
                "Leadership",
                "Practical",
                "Conventional",
            ],
        },
        score: { type: Number, default: 1 },
    },
    { _id: true }
);

const questionSchema = new mongoose.Schema(
    {
        questionText: { type: String, required: true },
        order: { type: Number, default: 0 },
        category: { type: String },
        options: { type: [optionSchema], required: true },
    },
    { _id: true }
);

const assessmentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        dimensions: {
            type: [String],
            default: [
                "Analytical",
                "Creative",
                "Social",
                "Leadership",
                "Practical",
                "Conventional",
            ],
        },
        questions: { type: [questionSchema], required: true },
        isActive: { type: Boolean, default: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

applySoftDelete(assessmentSchema);
const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
