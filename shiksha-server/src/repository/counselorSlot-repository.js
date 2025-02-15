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
  async getScheduleSlots(id,query) {
    try {
      const user = await User.findOne({ _id: id });
      const { page, limit } = query;
      console.log('user',user);
      if(user) {
        if (user.role === 'counsellor') {
         var filter = {counselorId: id};
         var model = ScheduleSlot;
         var populateFields = ['studentId'];
        }
        if(user.role === 'student') {
          var filter = {studentId: id};
          var model = ScheduleSlot;
          var populateFields = ['counselorId'];
        }

        const result = await model.find(filter).populate(populateFields).sort({createdAt: -1})
        .skip((page - 1) * limit)
        .limit(limit)
        .collation({ locale: 'en', strength: 2 });

        const totalDocuments = await model.countDocuments(filter);

        return {
          result,
          currentPage: page,
          totalPages: Math.ceil(totalDocuments / limit),
          totalDocuments,
        };
        

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
