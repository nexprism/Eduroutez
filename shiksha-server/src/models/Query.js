import mongoose from "mongoose";

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
            required: true,
        },
        queryRelatedTo: {
            type: String,
            required: true,
        },
        instituteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute",
            required: true,
        },
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
export default Query;