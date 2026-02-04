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
        status: {
            type: String,
            enum: ["Pending", "Open", "Closed"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

const Query = mongoose.model("Query", querySchema);
applySoftDelete(querySchema);
export default Query;