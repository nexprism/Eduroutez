import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const newsSchema = new mongoose.Schema(
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
        date: {
            type: Date,
            default: Date.now,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const News = mongoose.model("News", newsSchema);
applySoftDelete(newsSchema);
export default News;
    