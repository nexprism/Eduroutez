import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CounselorSlotSchema = new Schema({
    counselorEmail: {
        type: String,
        required: true,
        unique: true
    },
    mondayStart: {
        type: String,
        required: true
    },
    mondayEnd: {
        type: String,
        required: true
    },
    tuesdayStart: {
        type: String,
        required: true
    },
    tuesdayEnd: {
        type: String,
        required: true
    },
    wednesdayStart: {
        type: String,
        required: true
    },
    wednesdayEnd: {
        type: String,
        required: true
    },
    thursdayStart: {
        type: String,
        required: true
    },
    thursdayEnd: {
        type: String,
        required: true
    },
    fridayStart: {
        type: String,
        required: true
    },
    fridayEnd: {
        type: String,
        required: true
    },
    saturdayStart: {
        type: String,
        required: true
    },
    saturdayEnd: {
        type: String,
        required: true
    },
    sundayStart: {
        type: String,
        required: true
    },
    sundayEnd: {
        type: String,
        required: true
    }
});

const CounselorSlot = mongoose.model("CounselorSlot", CounselorSlotSchema);
export default CounselorSlot ;