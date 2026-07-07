import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const replySchema = new mongoose.Schema(
  {
    answer: { type: String },
    repliedBy: { type: String },
    repliedAt: { type: Date, default: Date.now },
    editedAt: { type: Date },
    isEdited: { type: Boolean, default: false },
  },
  { _id: true }
);

const answerSchema = new mongoose.Schema(
  {
    answer: { type: String },
    answeredBy: { type: String },
    answeredAt: { type: Date, default: Date.now },
    editedAt: { type: Date },
    isEdited: { type: Boolean, default: false },
    replies: [replySchema],
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
    tags: [{ type: String }],
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published" },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    editedAt: { type: Date },
    isEdited: { type: Boolean, default: false },
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
