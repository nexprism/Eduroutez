import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const answerSchema = new mongoose.Schema(
  {
    answer: { type: String },
    answeredBy: { type: String },
    answeredAt: { type: Date, default: Date.now },
    editedAt: { type: Date },
    isEdited: { type: Boolean, default: false },
    likes: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["upvote", "downvote"] },
      },
    ],
  },
  { _id: true }
);

const questionAnswerSchema = new mongoose.Schema(
  {
    question: { type: String },
    answer: { type: String },
    answers: [answerSchema],
    grade: { type: String },
    label: { type: String },
    askedBy: { type: String },
    answeredBy: { type: String },
    instituteEmail: { type: String },
    questionLikes: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["upvote", "downvote"] },
      },
    ],
  },
  { timestamps: true }
);

const QuestionAnswer = mongoose.model("QuestionAnswer", questionAnswerSchema);
applySoftDelete(questionAnswerSchema);
export default QuestionAnswer;
