import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "like_blog", "unlike_blog",
        "like_course", "unlike_course",
        "like_career", "unlike_career",
        "wishlist_institute", "unwishlist_institute",
        "wishlist_course", "unwishlist_course",
        "review_submitted",
        "review_updated",
        "points_earned",
        "points_redeemed",
        "referral_used",
        "question_asked",
        "counselor_booked",
        "webinar_registered",
        "profile_updated",
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Blog", "Course", "Career", "Institute", "Review", "User", "Counselor", "Webinar"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    targetName: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);
applySoftDelete(activitySchema);
export default Activity;
