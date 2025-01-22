import { console } from "inspector";
import Counselor from "../models/Counselor.js";
import CrudRepository from "./crud-repository.js";
import User from "../models/User.js";

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
      const result = await this.model.findOne({ email:email });
      console.log('result',result)
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


  async book(email, studentData) {
    try {
      console.log(email, studentData);
      const result = await this.model.findOneAndUpdate(
        { email: email }, // Match the schema field
        { $push: { students: studentData } }, // Push student data into the students array
        { new: true } // Return the updated document
      );
      if (!result) {
        throw new Error('Counselor with the given email not found');
      }
  
      return result; // Return the updated document
    } catch (error) {
      console.error("Error in book function:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      // First check if counselor exists in User table
      const user = await User.findOne({ _id: id });
      if (!user) {
        throw new Error('User with the given id not found');
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
