import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const purchasedWebinarPackageSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: [true, "Institute ID is required"],
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WebinarPackage",
      required: [true, "Package ID is required"],
    },
    webinarLimit: {
      type: Number,
      required: [true, "Webinar limit is required"],
      min: [1, "Webinar limit must be at least 1"],
    },
    usedWebinars: {
      type: Number,
      default: 0,
      min: [0, "Used webinars cannot be negative"],
    },
    remainingWebinars: {
      type: Number,
      required: [true, "Remaining webinars must be specified"],
      min: [0, "Remaining webinars cannot be negative"],
    },
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message: "Invalid payment status",
      },
      default: "pending",
    },
    transactionId: {
      type: String,
      sparse: true,
      trim: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
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

// Virtual to calculate usage percentage
purchasedWebinarPackageSchema.virtual("usagePercentage").get(function () {
  if (this.webinarLimit === 0) return 0;
  return Math.round((this.usedWebinars / this.webinarLimit) * 100);
});

// Virtual to check if purchase is active and not expired
purchasedWebinarPackageSchema.virtual("isActive").get(function () {
  return !this.isExpired && this.paymentStatus === "completed" && this.expiryDate > new Date();
});

// Index for frequently queried fields
purchasedWebinarPackageSchema.index({ instituteId: 1, deletedAt: 1 });
purchasedWebinarPackageSchema.index({ packageId: 1 });
purchasedWebinarPackageSchema.index({ paymentStatus: 1 });
purchasedWebinarPackageSchema.index({ expiryDate: 1 });
purchasedWebinarPackageSchema.index({ isExpired: 1 });

// Validation middleware
purchasedWebinarPackageSchema.pre("save", function (next) {
  // Ensure remainingWebinars = webinarLimit - usedWebinars
  this.remainingWebinars = this.webinarLimit - this.usedWebinars;

  // Check if expired
  if (this.expiryDate < new Date()) {
    this.isExpired = true;
  }

  // Ensure used webinars don't exceed limit
  if (this.usedWebinars > this.webinarLimit) {
    throw new Error("Used webinars cannot exceed the webinar limit");
  }

  next();
});

const PurchasedWebinarPackage = mongoose.model(
  "PurchasedWebinarPackage",
  purchasedWebinarPackageSchema
);
applySoftDelete(purchasedWebinarPackageSchema);

export default PurchasedWebinarPackage;
