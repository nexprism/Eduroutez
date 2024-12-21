import Institute from "../models/Institute.js";
import CrudRepository from "./crud-repository.js";

class InstituteRepository extends CrudRepository {
  constructor() {
    super(Institute);
  }

  async addCourse(id, data) {
    try {
      const result = await this.model.findByIdAndUpdate(
        id, 
        { $push: { courses: data } }, // Append new course data to the `courses` array
        { new: true } // Return the updated document
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async removeCourse(instituteId, courseId) {
    try {
      // Find the institute by its ID
      const institute = await this.model.findById(instituteId);
  
      // If institute not found, throw an error
      if (!institute) {
        throw new Error("Institute not found");
      }
      // Remove the course reference from the courses array using $pull operator
      institute.courses = institute.courses.filter(course => course._id.toString() !== courseId);
      
      // Save the updated institute document
      await institute.save();
  
      return institute; // Return the updated institute document (optional)
    } catch (error) {
      throw new Error(`Error removing course from institute: ${error.message}`);
    }
  }
  
}

export { InstituteRepository };
