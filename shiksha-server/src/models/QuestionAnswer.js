import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const questionAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    answers: {
      type: Array,
    },
    grade:{
      type:String
    },
    label:{
      type:String
    },
    askedBy: {
      type: String,
      // ref: "Student",
    },
    answeredBy: {
      type: String,
      // ref: "Counselor",
    },
    instituteEmail:{
      type:String,
    }
  },
  { timestamps: true }
);

const QuestionAnswer = mongoose.model("QuestionAnswer", questionAnswerSchema);
applySoftDelete(questionAnswerSchema);
export default QuestionAnswer;
