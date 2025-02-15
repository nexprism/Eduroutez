import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const feedbackSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
applySoftDelete(feedbackSchema);
export default Feedback;
