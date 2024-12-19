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
  
}

export { InstituteRepository };
