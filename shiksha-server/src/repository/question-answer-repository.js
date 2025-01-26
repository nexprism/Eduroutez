import QuestionAnswer from "../models/QuestionAnswer.js";
import CrudRepository from "./crud-repository.js";

class QuestionAnswerRepository extends CrudRepository {
  constructor() {
    super(QuestionAnswer);
  }
  async getbyInstituteEmail(email) {
    try {
  console.log('email',email);
      var result = await this.model.find({ instituteEmail: email });
     

      if (result.askedBy) {
        var result = await this.model.findById(result._id).populate("askedBy");
      }

      
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  async getQuestion(id) {
    try {
      console.log('hello',id);
      let result = await this.model.findById(id).populate("askedBy");
      return result;
    } catch (error) {
      throw error;
    }
}
}


export { QuestionAnswerRepository };
