import QuestionAnswer from "../models/QuestionAnswer.js";
import CrudRepository from "./crud-repository.js";

class QuestionAnswerRepository extends CrudRepository {
  constructor() {
    super(QuestionAnswer);
  }
}

export { QuestionAnswerRepository };
