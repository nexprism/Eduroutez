import mongoose from "mongoose";

const studentWebinarBookingSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        webinar: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Webinar",
            required: true,
        },
        amountPaid: {
            type: Number,
            required: true,
        },
        walletUsed: {
            type: Number,
            default: 0,
        },
        referralCodeUsed: {
            type: String,
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "COMPLETED",
        },
        attendanceStatus: {
            type: String,
            enum: ["NOT_ATTENDED", "ATTENDED"],
            default: "NOT_ATTENDED",
        },
        bookedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const StudentWebinarBooking = mongoose.model("StudentWebinarBooking", studentWebinarBookingSchema);
export default StudentWebinarBooking;
