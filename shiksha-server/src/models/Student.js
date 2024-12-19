import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
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
    designation: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
    accountHolderName: {
      type: String,
    },
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
        certificateImage: {
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
          required: true, //Full time, Part time, Internship, Contract, Freelance
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
          required: true, //Onsite, Remote
        },
        currentlyWorking: {
          type: Boolean,
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
    skills: [
      {
        type: String,
      },
    ],
    adharCardImage: {
      type: String,
    },
    panCardImage: {
      type: String,
    },
    tenthMarksheetImage: {
      type: String,
    },
    twelthMarksheetImage: {
      type: String,
    },
    referralCode: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
