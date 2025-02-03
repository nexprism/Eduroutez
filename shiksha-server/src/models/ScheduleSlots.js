import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ScheduleSlotSchema = new Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    counselorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counselor',
        required: true
    },
    slot: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    link: {
        type: String,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    paymentId: {
        type: String,
        required: true
    },
});

const ScheduleSlot = mongoose.model("ScheduleSlot", ScheduleSlotSchema);
export default ScheduleSlot;
