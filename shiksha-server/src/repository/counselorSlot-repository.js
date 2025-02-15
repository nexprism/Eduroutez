import Counselor from "../models/Counselor.js";
import CounselorSlot from "../models/CounselorSlot.js";
import ScheduleSlot from "../models/ScheduleSlots.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import CrudRepository from "./crud-repository.js";

class CounselorSlotRepository extends CrudRepository {
  constructor() {
    super(CounselorSlot);
  }

  async get(email) {
    try {
      const result = await this.model.findOne({ counselorEmail: email });

      if (result) {
        const counselor = await Counselor.findOne({ email: email });

        const scheduledSlots = await ScheduleSlot.find({
          counselorId: counselor._id,
          status: 'scheduled'
        });

        // Convert result to a plain JavaScript object if it's a Mongoose document
        const resultObject = result.toObject ? result.toObject() : result;

        // Add scheduledSlots to the result object
        resultObject.scheduledSlots = scheduledSlots;

        return resultObject;
      }

      return result;

    } catch (error) {
      throw error;
    }
  }

  //getScheduleSlots
  async getScheduleSlots(id) {
    try {
      const user = await User.findOne({ _id: id });
      console.log('user',user);
      if(user) {
        if (user.role === 'counsellor') {
          const scheduledSlots = await ScheduleSlot.find({
            counselorId: id,
          }).populate('studentId');
          console.log('scheduledSlots',scheduledSlots);
          return scheduledSlots;
        }
        if(user.role === 'student') {
          const scheduledSlots = await ScheduleSlot.find({
            studentId: id,
          }).populate('counselorId');
          return scheduledSlots;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  //updateScheduleSlot
  async updateScheduleSlot(id,data) {
    try {
    const result = await ScheduleSlot.findOneAndUpdate(
      { _id: id },
      data,
      { new: true }
    );
        
      return result;
    } catch (error) {
      throw error;
    }
  }
          

  async update(email, data) {
    try {
      const result = await this.model.findOneAndUpdate(
        { counselorEmail: email },
        data,
        { new: true }
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

}

export { CounselorSlotRepository };
