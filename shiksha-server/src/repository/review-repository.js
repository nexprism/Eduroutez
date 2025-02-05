import Review from "../models/Review.js";
import CrudRepository from "./crud-repository.js";

class ReviewRepository extends CrudRepository {
  constructor() {
    super(Review);
  }

  //getAllByInstitute
  async getAllByInstitute(instituteId) {
    try {
      const reviews = await Review.find({ institute: instituteId });
      return reviews;
    }
    catch (error) {
      throw error;
    }
  }


  async getAllByUser(email) {
    try {
      const reviews = await Review.find({ email: email }).populate('institute');
      return reviews;
    } catch (error) {
      throw error;
    }
  }
}



export { ReviewRepository };
