import QuestionAnswer from "../models/QuestionAnswer.js";
import CrudRepository from "./crud-repository.js";

class QuestionAnswerRepository extends CrudRepository {
  constructor() {
    super(QuestionAnswer);
  }
  async getbyInstituteEmail(email) {
    try {
  console.log('email',email);
      const result = await this.model.find({ instituteEmail: email });
      return result;
    } catch (error) {
      throw error;
    }
  }

  //submitAnswer
  async submitAnswer(id, data) {
    try {

      const answers = {
        answer: data.answer,
        answeredBy: data.answeredBy,
        answeredAt: new Date()
      };

      const result = await this.model
        .findByIdAndUpdate(id, { $push: { answers: answers } }, { new: true });

      return result;

    } catch (error) {
      throw error;
    }
  }




      
  
  async getQuestion(id) {
    try {
      console.log('hello',id);
      let result = await this.model.findById(id);
      return result;
    } catch (error) {
      throw error;
    }
}
}


export { QuestionAnswerRepository };
