import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const webinarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    webinarLink: {
      type: String,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    duration: {
      type: String,
    },
    webinarCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Webinar = mongoose.model("Webinar", webinarSchema);
applySoftDelete(webinarSchema);
export default Webinar;
