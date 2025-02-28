import { console } from "inspector";
import Counselor from "../models/Counselor.js";
import CrudRepository from "./crud-repository.js";
import User from "../models/User.js";
import ScheduleSlot from "../models/ScheduleSlots.js";
import Student from "../models/Student.js";
import WalletTransaction from "../models/WalletTransaction.js";

class CounselorRepository extends CrudRepository {
  constructor() {
    super(Counselor);
  }

  async makeCounselor(data) {
    const { email } = data;
    let counselor = await this.model.findOne({ email });

    if (counselor) {
      counselor = await this.model.findOneAndUpdate({ email }, data, { new: true });
    } else {
      counselor = new this.model(data);
      await counselor.save();
    }

    return counselor;
  }
  
  async get(email) {
    try {
      console.log('counsellor email',email);
      const result = await this.model.find({ email: email });
      console.log('counsellor result',result)
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getByid(id) {
    console.log('result',id);
    try {
      const result = await this.model.findOne({ _id: id });
      return result;
    } catch (error) {
      console.log('error',error.message);
    }
  }

  //getByCategory
  async getByCategory(category) {
    try {
      const counselors = await this.model.find({ category: category });
      return counselors;
    } catch (error) {
      throw error;
    }
  }

  //getByEmail
  async getByEmail(email) {
    try {
      const result = await Counselor.findOne({ email });
      console.log('result',result);
      return result;
    } catch (error) {
      throw error;
    }
  }

  //getCounselorsByInstitute
  async getCounselorsByInstitute(instituteId) {
    try {
      const counselors = await this.model.find({ instituteId: instituteId });
      return counselors;
    } catch (error) {
      throw new Error("Cannot fetch data of all the counselors");
    }
  }


  async book(id, studentData) {
    try {
      
      const counselor = await this.model.findOne({ _id: id });

      const slot = await ScheduleSlot.findOne({ date: studentData.date, slot: studentData.slot, status: "scheduled" });
      if (slot) {
        throw new Error('This slot is already booked,Plese select another slot');
      }

      // Create a new slot
      const newSlot = await ScheduleSlot.create({
        counselorId: id,
        studentId: studentData.studentId,
        date: studentData.date,
        slot: studentData.slot,
        status: "scheduled",
        paymentId: studentData.paymentId,
      });

      var totalamount = 500;

      //30% of 500
      var commission = totalamount * 0.3;
      

      const user = await User.findOne({ _id: counselor._id });
      if (user) {
        // If user exists, update the existing entry
        user.balance = user.balance + commission;

        await user.save();

      }

      counselor.balance = counselor.balance + commission;
      await counselor.save();

      const student = await Student.findOne({ _id: studentData.studentId });

      const walletTransaction = await WalletTransaction.create({
        user: counselor._id,
        type: "CREDIT",
        amount: commission,
        remarks: "Counselling fee of slot " + studentData.slot + " booked by " + student.name + " On " + studentData.date,
        status: "COMPLETED",
        paymentId: studentData.paymentId, 
      });
  
      return newSlot; // Return the updated document
    } catch (error) {
      console.error("Error in book function:", error.message);
      throw error;
    }
  }

  async updateCounsellor(id, data) {
    try {
      console.log('id', id);
      console.log('fdcounselor data', data);

      // First check if counselor exists in User table
      const user = await User.findOne({ _id: id });
      if (user) {
        // If user exists, update the existing entry
        user.name = data.firstname + ' ' + data.lastname;
        user.email = data.email;
        user.contact_number = data.contactno; 
        user.country = data.country;
        user.state = data.state;
        user.city = data.city;

        await user.save();
        
      }
  
      // Check if counselor already exists in Counselor table
      let counselor = await this.model.findOne({ _id: id });
  
      if (!counselor) {
        // If counselor doesn't exist, create new entry
        counselor = await this.model.create({
          _id: id,  // Use same ID as user table
          ...data
        });
      } else {
        // If counselor exists, update the existing entry
        counselor = await this.model.findOneAndUpdate(
          { _id: id },
          data,
          { new: true }
        );
      }
  
      return counselor;
  
    } catch (error) {
      console.log('error', error.message);
      throw error;
    }
  }

  async mark(data) {
    try {
      const { email, studentEmail } = data;
  
      // Find the counselor and ensure the student exists
      const counselor = await this.model.findOne({ email });
      if (!counselor) {
        throw new Error('Counselor with the given email not found');
      }
  
      // Find the index of the student in the students array
      const studentIndex = counselor.students.findIndex(student => student.studentEmail === studentEmail);
      if (studentIndex === -1) {
        throw new Error('Student with the given email not found');
      }
  
      // Toggle the 'completed' field for the student
      const student = counselor.students[studentIndex];
      student.completed = !student.completed;
  
      // Update the specific student in the students array
      const result = await this.model.findOneAndUpdate(
        { email, "students.studentEmail": studentEmail },
        { $set: { "students.$.completed": student.completed } }, // Update only the matched student's `completed` field
        { new: true } // Return the updated document
      );
  
      if (!result) {
        throw new Error('Failed to update the student status');
      }
  
      return result; // Return the updated counselor document
    } catch (error) {
      console.error("Error in mark function:", error);
      throw error;
    }
  }
  
}


export { CounselorRepository };
