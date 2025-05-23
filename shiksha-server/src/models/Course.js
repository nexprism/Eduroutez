import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const courseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
    },
    slug: {
      type: String,
    },
    courseType: {
      type: String,
    },
    courseCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
    instructor: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Counselor",
      type: String,
    },
    courseLevel: {
      type: String,
    },
    shortDescription: {
      type: String,
    },
    longDescription: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCategory",
    },
    instituteCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
    visibility: {
      type: String,
    },
    language: {
      type: String,
    },
    eligibility: {
      type: String,
    },
    cutOff: {
      type: String,
    },
    examAccepted: {
      type: String,
    },
    courseDurationYears: {
      type: Number,
      set: function(val) {
        // Handle the string "null" case
        if (val === "null") return null;
        return val;
      }
    },
    courseDurationMonths: {
      type: Number,
      set: function(val) {
        // Also handle the "null" case for consistency
        if (val === "null") return null;
        return val;
      }
    },
    courseOverview: {
      type: String,
    },
    courseEligibility: {
      type: String,
    },
    courseCurriculum: {
      type: String,
    },
    courseFee: {
      type: String,
    },
    courseOpportunities: {
      type: String,
    },
    isCourseFree: {
      type: String,
    },
    isCoursePopular: {
      type: Boolean,
      default: false,
    },
    isCourseTrending: {
      type: Boolean,
      default: false,
    },
    coursePrice: {
      type: Number,
    },
    courseMaxPrice: {
      type: Number,
    },
    courseMinPrice: {
      type: Number
    },
    courseDiscount: {
      type: Number,
    },
    courseDiscountType: {
      type: String,
    },
    coursePreviewType: {
      type: String,
    },
    coursePreviewUrl: {
      type: String,
    },
    coursePreviewThumbnail: {
      type: String,
    }, // image
    coursePreviewCover: {
      type: String,
    }, // image
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
    metaImage: {
      type: String,
    }, //image
    applicationStartDate: {
      type: Date,
    },
    applicationEndDate: {
      type: Date,
    },
    pros: {
      type: String,
    },
    cons: {
      type: String,
    },
    status: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
      },
    ],
    reviews: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
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
        reviewedAt: {
          type: Date,
          default: Date.now,
      },
    },
  ],
  },
  { timestamps: true }
);

export { courseSchema };
const Course = mongoose.model("Course", courseSchema);
applySoftDelete(courseSchema);
export default Course;