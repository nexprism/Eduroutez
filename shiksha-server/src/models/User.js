// This is only for admin and super admin
// both roles and access are defined already in the database

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "SUPER_ADMIN","student","institute","counsellor"], // "STUDENT", "COUNSELOR", "INSTITUTE",  they have thier different tables
      default: "student",
    },
    access: [
      {
        type: String,
      },
    ],
    contact_number: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    refer_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    my_referrals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    country: {
      type: String,
    },
    date_of_birth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    designation: {
      type: String,
    },
    about: {
      type: String,
    },
    course_wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    college_wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institute",
      },
    ],

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
