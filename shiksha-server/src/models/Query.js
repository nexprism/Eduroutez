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
        query: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Query = mongoose.model("Query", querySchema);
export default Query;