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
applySoftDelete(questionAnswerSchema);
export default FAQ;
