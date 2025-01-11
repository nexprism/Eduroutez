// import QuestionAnswer from "../models/QuestionAnswer.js";
import FAQ from '../models/FAQ.js';
import CrudRepository from "./crud-repository.js";

class FAQRepository extends CrudRepository {
  constructor() {
    super(FAQ);
  }

  async create(data) {
    try {
      const questionAnswer = await this.model.create(data);
      return questionAnswer;
    } catch (error) {
      throw error;
    }
  }

  async destroyid(id) {
    try {
      console.log('dfgtyhutre',id);
      const result = await this.model.findByIdAndDelete(id);
      return result;
      console.log('result',result);
    } catch (error) {
      throw error;
    }
  }

  async getAll(filter, sort, page, limit) {
    try {
      const questionAnswers = await this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec();
      return questionAnswers;
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    const questionAnswer = await this.model.findById(id);
    return questionAnswer;
  }

  async getAllByInstitute(instituteId) {
    try {
      console.log('iddfrt',instituteId);
      const faqs = await FAQ.find({ instituteId:instituteId });
      console.log(faqs);
      return faqs;
    } catch (error) {
      console.error('Error in FAQ.getAllByInstitute:', error.message);
      throw error;
    }
  }
}

export { FAQRepository };
