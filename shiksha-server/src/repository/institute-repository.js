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

  //updateCourse
  async updateCourse(instituteId, courseId, data) {
    try {
      // Find the institute by its ID
      const institute = await this.model.findById(instituteId);
  
      // If institute not found, throw an error
      if (!institute) {
        throw new Error("Institute not found");
      }

    

      const result = await this.model.findOneAndUpdate(
        { _id: instituteId, 'courses._id': courseId },
        { $set: { 'courses.$.updatedAt': new Date() } }, // Update only the updatedAt field
        { new: true }
      );

    return result;


    
    } catch (error) {
      console.log(`Error updating course: ${error.message}`);
    }

  }





  //addGallery
  async addGallery(id, data) {
    try {
      const result = await this.model.findByIdAndUpdate(
        id, 
        { $push: { gallery: data } }, // Append new course data to the `courses` array
        { new: true } // Return the updated document
      );
      return result;
    } catch (error) {
      throw error;
    }
  }


  async addReview(id, data) {
    try {
      const result = await this.model.findByIdAndUpdate(
        id, 
        { $push: { reviews: data } }, // Append new course data to the `courses` array
        { new: true } // Return the updated document
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addFacility(id, data) {
    try {
    
      const result = await this.model.findByIdAndUpdate(
        id, 
        { $push: { facilities: data } },
        { new: true }
      );
      return result;
    } catch (error) {
      console.log('error',error.message);
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

  async getByEmail(email) {
    try {
      console.log('hello2')
      const result = await this.model.findOne({ email }); // Query by email
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  async make(email,data){
    try {
      const institute = await this.model.findOneAndUpdate(
        { email },
        { $set: data },
        { new: true, upsert: true } // Create a new document if no match is found
      );
      return institute;
    } catch (error) {
      throw error;
    }
  }

  async upgrade(email, data) {
    try {
      const result = await this.model.findOneAndUpdate(
        { email },
        { $set: { plan: data?.subscriptionId,planName:data?.planName } }, // Set the `plan` field with the id
        { new: true } // Return the updated document
      );
      // console.log('hi',result);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export { InstituteRepository };
