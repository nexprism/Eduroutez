// import QuestionAnswer from "../models/QuestionAnswer.js";
import FAQ from '../models/FAQ.js';
import CrudRepository from "./crud-repository.js";

class FAQRepository extends CrudRepository {
  constructor() {
    super(FAQ);
  }
}

export { FAQRepository };
