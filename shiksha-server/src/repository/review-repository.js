import Review from "../models/Review.js";
import CrudRepository from "./crud-repository.js";

class ReviewRepository extends CrudRepository {
  constructor() {
    super(Review);
  }
}

export { ReviewRepository };
