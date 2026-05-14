import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const webinarPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
      minlength: [3, "Package name must be at least 3 characters"],
      maxlength: [100, "Package name cannot exceed 100 characters"],
    },
    webinarCount: {
      type: Number,
      required: [true, "Number of webinars is required"],
      min: [1, "Must include at least 1 webinar"],
      max: [1000, "Cannot exceed 1000 webinars"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to check if package is currently on sale
webinarPackageSchema.virtual("isSaleLive").get(function () {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
});

// Index for frequently queried fields
webinarPackageSchema.index({ isActive: 1, deletedAt: 1 });
webinarPackageSchema.index({ startDate: 1, endDate: 1 });
webinarPackageSchema.index({ createdBy: 1 });

// Validation middleware to ensure startDate < endDate
webinarPackageSchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    throw new Error("Start date must be before end date");
  }
  if (this.salePrice > this.originalPrice) {
    throw new Error("Sale price cannot be greater than original price");
  }
  next();
});

const WebinarPackage = mongoose.model("WebinarPackage", webinarPackageSchema);
applySoftDelete(webinarPackageSchema);

export default WebinarPackage;
