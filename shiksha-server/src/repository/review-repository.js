import Review from "../models/Review.js";
import CrudRepository from "./crud-repository.js";

class ReviewRepository extends CrudRepository {
  constructor() {
    super(Review);
  }

  async getAllByUser(email) {
    try {
      const reviews = await Review.find({ email: email });
      return reviews;
    } catch (error) {
      throw error;
    }
  }
}



export { ReviewRepository };
