import mongoose from "mongoose";

const questionAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
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
    instituteId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Institute'
    }
  },
  { timestamps: true }
);

const QuestionAnswer = mongoose.model("QuestionAnswer", questionAnswerSchema);
export default QuestionAnswer;
