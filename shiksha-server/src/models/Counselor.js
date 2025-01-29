import mongoose from "mongoose";

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
    city: {
      type: String,
      // required: true,
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
      type: String,
      // required: true,
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
    accountDetails: { type: String },
    ifscCode: { type: String },
    reviews: [
      {
        studentEmail: {
          type: String,
          // required: true,
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
        date: {
          type: String,
          // required: true,
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
export default Counselor;
