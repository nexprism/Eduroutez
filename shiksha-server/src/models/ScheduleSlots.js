import mongoose from "mongoose";
import { applySoftDelete } from "../middlewares/softDelete.js";

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
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    paymentId: {
        type: String,
        required: true
    },
}, { timestamps: true });

const ScheduleSlot = mongoose.model("ScheduleSlot", ScheduleSlotSchema);
applySoftDelete(ScheduleSlotSchema);
export default ScheduleSlot;
