import mongoose from "mongoose";

const questionAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
    },
  },
  { timestamps: true }
);

const QuestionAnswer = mongoose.model("QuestionAnswer", questionAnswerSchema);
export default QuestionAnswer;
