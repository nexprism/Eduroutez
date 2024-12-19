import mongoose from "mongoose";

const counselorSchema = new mongoose.Schema(
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
    }, // image
    password: {
      type: String,
      required: true,
    },
    counselorCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstItute",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
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
          required: true,
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
    commission: {
      type: Number,
      required: true,
    },
    eventCommission: {
      type: Number,
      required: true,
    },

    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const Counselor = mongoose.model("Counselor", counselorSchema);
export default Counselor;
