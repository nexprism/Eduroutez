import Webinar from "../models/Webinar.js";
import CrudRepository from "./crud-repository.js";
import mongoose from "mongoose";

class WebinarRepository extends CrudRepository {
  constructor() {
    super(Webinar);
  }

  async getAll() {
    try {
      const blogs = await Webinar.find();
      return blogs;
    } catch (error) {
      console.error('Error in BlogRepository.getAll:', error.message);
      throw error;
    }
  }

  getwebinarById(id) {
    try {
      const webinar = Webinar.findById(id);
      return webinar;
    } catch (error) {
      console.error('Error in WebinarRepository.getwebinarById:', error.message);
      throw error;
    }
  }

  async get(userId) {
    try {
      // Log the received userId
      console.log("Received userId:", userId);

      // Handle case where userId is an object
      const userIdString = typeof userId === 'object' ? userId.webinarCreatedBy : userId;

      // Validate the userId format and ensure it's a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        const error = new Error("Invalid user ID format");
        error.statusCode = 400; // Add HTTP status code
        throw error;
      }

      // Convert the userId to ObjectId
      const objectId = new mongoose.Types.ObjectId(userIdString);
  
      // Query the database
      const webinars = await Webinar.find({ webinarCreatedBy: objectId });
      
      if (!webinars || webinars.length === 0) {
        const error = new Error("No webinars found for this user");
        error.statusCode = 404;
        throw error;
      }
      
      return webinars;
    } catch (error) {
      // Preserve the status code if it exists, otherwise use 500
      error.statusCode = error.statusCode || 500;
      console.error('Error in WebinarRepository.get:', error);
      throw error; // Throw the error with status code
    }
  }
}



export { WebinarRepository };