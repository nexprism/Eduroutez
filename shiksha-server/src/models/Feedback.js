import mongoose from "mongoose";

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
export default Feedback;
