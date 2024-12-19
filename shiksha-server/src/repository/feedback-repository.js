import Feedback from "../models/Feedback.js";
import CrudRepository from "./crud-repository.js";

class FeedbackRepository extends CrudRepository {
  constructor() {
    super(Feedback);
  }
}

export { FeedbackRepository };
