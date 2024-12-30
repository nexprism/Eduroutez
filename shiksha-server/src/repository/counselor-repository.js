import Student from "../models/Student.js";
import CrudRepository from "./crud-repository.js";

class CounselorRepository extends CrudRepository {
  constructor() {
    super(Student);
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
      const result = await this.model.findOne({ email });
      return result;
    } catch (error) {
      throw error;
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
