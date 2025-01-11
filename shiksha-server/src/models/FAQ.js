import mongoose from "mongoose";

const questionAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    email:{
      type:String,
    },
    instituteId:{
      type:String,
    },
  },
  { timestamps: true }
);

const FAQ = mongoose.model("FAQ", questionAnswerSchema);
export default FAQ;
