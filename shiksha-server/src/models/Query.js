import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";
const querySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNo: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: false,
        },
        queryRelatedTo: {
            type: String,
            required: false,
        },
        stream: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stream",
        },
        level: {
            type: String,
        },
        instituteIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Institute",
            },
        ],
        query: {
            type: String,
            required: true,
        },
        specialization: {
            type: String,
        },
        type: {
            type: String,
            enum: ["query", "application"],
            default: "query",
        },
        status: {
            type: String,
            enum: ["Pending", "Open", "Closed"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

applySoftDelete(querySchema);
const Query = mongoose.model("Query", querySchema);
export default Query;