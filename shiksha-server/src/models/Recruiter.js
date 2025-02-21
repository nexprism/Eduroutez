import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const recruiterSchema = new mongoose.Schema(
    {
        institute: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute",
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Recruiter = mongoose.model("Recruiter", recruiterSchema);
applySoftDelete(recruiterSchema);
export default Recruiter;
