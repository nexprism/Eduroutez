import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const counselorSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
    contactno: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    state: {
      type: {
        name: String,
        iso2: String,
      },
    },
    city: {
      type: {
        name: String,
      },
    },
    dateOfBirth: {
      type: Date,
      // required: true,
    },
    gender: {
      type: String,
      // required: true,
    },
    address: {
      type: String,
    },
    country: {
      type: {
        name: String,
        iso2: String,
      },
    },
    profilePhoto: {
      type: String,
    }, // image
    adharCard: {
      type: String,
    }, // image
    panCard: {
      type: String,
    }, // image
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      'ref': 'Institute',
    },
    
    category: {
      type: String,
      // ref: "Category",
    },
    language: {
      type: String,
      // ref: "Category",
    },
    ExperienceYear: {
      type: String,
      // ref: "Category",
    },
    rating:{
      type:Number,
      default:2
    },
    wallet: {
      type: String,
      // ref: "Level",
    },
    
    points: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },

    level: {
      type: String,
      default: "Career Advisor",
    },

  
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolderName: { type: String },
    ifscCode: { type: String },
    reviews: [
      {
        studentEmail: {
          type: String,
          ref: "Student",
        },
        rating: {
          type: Number,
          // required: true,
        },
        comment: {
          type: String,
          // required: true,
        },
        slot: {
          type: String,
          // required: true,
        },
        counselorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Counselor",
        },
        date: {
          type: String,
          // required: true,
        },
        reviewedAt: {
          type: Date,
          default: Date.now,
        },

      },
    ],
    educations: [
      {
        institute: {
          type: String,
          required: true,
        },
        degree: {
          type: String,
          required: true,
        },
        program: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        currentlyEnrolled: {
          type: Boolean,
        },
        endDate: {
          type: Date,
        },
        description: {
          type: String,
        },
      },
    ],
    experiences: [
      {
        title: {
          type: String,
        },
        employmentType: {
          type: String,
        },
        companyName: {
          type: String,
        },
        location: {
          type: String,
        },
        locationType: {
          type: String,
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        isCurrentlyWorking: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    instituteEmail: {
      type: String,
      // required: true,
    },
    students: [
      {
        studentEmail: {
          type: String,
          // required: true,
        },
        slot: {
          type: String,
          // required: true,
        },
        date: {
          type: String,
          // required: true,
        },
        completed:{
          type:Boolean,
          default:false
        }
      },
    ],
  },
  { timestamps: true }
);

const Counselor = mongoose.model("Counselor", counselorSchema);

applySoftDelete(counselorSchema);
export default Counselor;
