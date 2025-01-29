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
        
    },
    mondayEnd: {
        type: String,
        
    },
    tuesdayStart: {
        type: String,
        
    },
    tuesdayEnd: {
        type: String,
        
    },
    wednesdayStart: {
        type: String,
        
    },
    wednesdayEnd: {
        type: String,
        
    },
    thursdayStart: {
        type: String,
        
    },
    thursdayEnd: {
        type: String,
        
    },
    fridayStart: {
        type: String,
        
    },
    fridayEnd: {
        type: String,
        
    },
    saturdayStart: {
        type: String,
        
    },
    saturdayEnd: {
        type: String,
        
    },
    sundayStart: {
        type: String,
        
    },
    sundayEnd: {
        type: String,
        
    }
});

const CounselorSlot = mongoose.model("CounselorSlot", CounselorSlotSchema);
export default CounselorSlot ;