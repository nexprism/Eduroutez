import mongoose from "mongoose";

const webinarReferralCodeSchema = new mongoose.Schema(
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
        code: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

// Compound index to ensure one student-webinar combination has one code
webinarReferralCodeSchema.index({ student: 1, webinar: 1 }, { unique: true });

const WebinarReferralCode = mongoose.model("WebinarReferralCode", webinarReferralCodeSchema);
export default WebinarReferralCode;
