import mongoose from "mongoose";

const counselorSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    contactno: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      // required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    }, // image
    adharCard: {
      type: String,
    }, // image
    panCard: {
      type: String,
    }, // image
    instituteEmail: {
      type: String,
      // ref: "InstItute",
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
    bankName: { type: String },
    accountDetails: { type: String },
    ifscCode: { type: String },
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
          required: true,
        },
        employmentType: {
          type: String,
          required: true,
        },
        companyName: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        locationType: {
          type: String,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        description: {
          type: String,
        },
      },
    ],
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
export default Counselor;
