// This is only for admin and super admin
// both roles and access are defined already in the database

import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

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
    plan:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subscription",
          default:"67921a8896ff8884c3a795a7"
        },
    planName: {
      type: String,
      default: "Free Plan"
    },
    expiryDate: {
      type: Date,
      //set defualt 1 motnth from now
      default: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      
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
      type: {
        name: String,
      }
    },
    state: {
      type: {
        name: String,
        iso2: String,
      }
    },
    referalCode: {
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
      type: {
        name: String,
        iso2: String,
      },
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
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      default: function () {
        if (this.role === "student") {
          return "Well Wisher";
        } else if (this.role === "counsellor") {
          return "Career Advisor";
        } else {
          return null;
        }
      }
      
    },
    balance: {
      type: Number,
      default: 0,
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
applySoftDelete(userSchema);
export default User;
