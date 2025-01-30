import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        state_id: {
            type: Number,
            required: true,
        },
        state_code: {
            type: String,
            required: true,
        },
        state_name: {
            type: String,
            required: true,
        },
        country_id: {
            type: Number,
            required: true,
        },
        country_code: {
            type: String,
            required: true,
        },
        country_name: {
            type: String,
            required: true,
        },
        latitude: {
            type: String,
            required: true,
        },
        longitude: {
            type: String,
            required: true,
        },
        wikiDataId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const City = mongoose.model("City", citySchema);
export default City;
