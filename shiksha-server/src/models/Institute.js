import mongoose from "mongoose";
import { courseSchema } from "./Course.js";
import { applySoftDelete } from "../middlewares/softDelete.js";


const instituteSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
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
    slug:{
      type:String,
    },
    address: {
      type: String,
    },
    country: {
      type: {
        name: String,
        iso2: String,
      }
    },
    state: {
      type:{
        name: String,
        iso2: String,
      }
    },
    city: {
      type: {
        name: String,
      }
      
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
    isTopInstitute: {
      type: Boolean,
      default: false,
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
    isTrending: {
      type: Boolean,
      default: false,
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

    fee: {
      type: String,
    },

    ranking: {
      type: String,
    },
    rank:{
      type:Number,
    },
    cutoff: {
      type: String,
    },

    campusInfo: {
      type: String,
    },
    scholarshipInfo: {
      type: String,
    },
    minFees: {
      type: String,
    },
    maxFees: {
      type: String,
    },
    affiliation: {
      type: String,
    },
    highestPackage: {
      type: String,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    streams: [
      {
        type: String,
      },
    ],
    specialization: [
      {
        type: String,
      },
    ],
    allocatedQueries: [
      {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Query",
      },
    ],
    gallery: [
      {
        type: String,
      },
    ],
    facilities: [
      {
        type: String,
      },
    ],
    password: {
      type: String,
      // required: true,
    },

    status: {
      type: Boolean,
      default: true,
    },
    onhold: {
      type: Boolean,
      default: false,
    },
    plan:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default:"67934e383ab889ea870789c3"
    },
    planName:{
      type:String,
      default:"Free Plan"
    },
    examAccepted: {
      type: String,
    },
    expiryDate:{
      type:Date,
      default: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    wishlist:[
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
    ],
    issues: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
  },
  { timestamps: true }
);
applySoftDelete(instituteSchema);
const Institute = mongoose.model("Institute", instituteSchema);
export default Institute;
