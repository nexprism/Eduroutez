import mongoose from "mongoose";

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
export default QuestionAnswer;
