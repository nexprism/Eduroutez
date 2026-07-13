import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const answerSchema = new mongoose.Schema(
    {
        questionId: { type: mongoose.Schema.Types.Mixed },
        selectedOptionIndex: { type: Number, required: true },
        dimension: { type: String },
    },
    { _id: false }
);

const instituteFitSchema = new mongoose.Schema(
    {
        instituteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute",
        },
        instituteName: { type: String },
        city: { type: String },
        state: { type: String },
        fitScore: { type: Number },
        matchedDimensions: { type: [String], default: [] },
        minFees: { type: Number },
        maxFees: { type: Number },
        ranking: { type: String },
    },
    { _id: false }
);

const assessmentResultSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        assessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
            required: true,
        },
        answers: { type: [answerSchema], default: [] },
        profile: { type: Map, of: Number, default: {} },
        dominantDimensions: { type: [String], default: [] },
        topInstitutes: { type: [instituteFitSchema], default: [] },
    },
    { timestamps: true }
);

applySoftDelete(assessmentResultSchema);
const AssessmentResult = mongoose.model(
    "AssessmentResult",
    assessmentResultSchema
);
export default AssessmentResult;
