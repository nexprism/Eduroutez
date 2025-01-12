import { cp } from "fs";
import News from "../models/news.js";
import CrudRepository from "./crud-repository.js";

class NewsRepository extends CrudRepository {
  constructor() {
      super(News);
  }

    //getNewsByInstitute
    async getNewsByInstitute(instituteId) {
        try {
            console.log("instituteId", instituteId);
            const news = await News.find({ institute: instituteId });
            return news;
        } catch (error) {
            throw error;
        }
    }

    //getAllNews
    async getAllNews() {
        try {
            const news = await News.find();
            return news;
        } catch (error) {
            throw error;
        }
    }

    //delete    
    async delete(id) {
        try {
            return await News.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }
}

export { NewsRepository };
