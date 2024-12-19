import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    colleges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institute",
      },
    ],
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  { timestamps: true }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
