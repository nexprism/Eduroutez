import mongoose from "mongoose";
import { courseSchema } from "./Course.js";

const instituteSchema = new mongoose.Schema(
  {
    instituteName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    institutePhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
      // required: true,
    },
    city: {
      type: String,
      // required: true,
    },
    establishedYear: {
      type: Number,
      // required: true,
    },
    website: {
      type: String,
      // required: true,
    },
    about: {
      type: String,
    },
    instituteLogo: {
      type: String,
    }, //image
    coverImage: {
      type: String,
    }, //image
    thumbnailImage: {
      type: String,
    }, //image
    organisationType: {
      type: String,
      // required: true,
    },
    brochure: {
      type: String,
    }, //image
    subscriptionType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    courses:{
      type:[courseSchema],
    }, 
    collegeInfo: {
      type: String,
    },

    courseInfo: {
      type: String,
    },

    admissionInfo: {
      type: String,
    },

    placementInfo: {
      type: String,
    },

    campusInfo: {
      type: String,
    },
    scholarshipInfo: {
      type: String,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    skills: [
      {
        type: String,
      },
    ],
    gallery: [
      {
        type: String,
      },
    ],
    password: {
      type: String,
      required: true,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Institute = mongoose.model("Institute", instituteSchema);
export default Institute;
