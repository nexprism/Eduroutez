import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const instituteIssuesSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        institute: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute",
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            Enum: ["Pending","Open", "Closed"],
            default: "Pending",
            
        },
        
    },
    {
        timestamps: true,
    }
);

const InstituteIssues = mongoose.model("InstituteIssues", instituteIssuesSchema);
applySoftDelete(instituteIssuesSchema);
export default InstituteIssues;
    