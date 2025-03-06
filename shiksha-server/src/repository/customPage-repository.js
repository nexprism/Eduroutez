import Page from "../models/CustomPage.js"
import CrudRepository from "./crud-repository.js";

class CustomPageRepository extends CrudRepository {
  constructor() {
    super(Page);
  }

  //getByStreamLevel
  async getByStreamLevel(stream, level) {
    try {
      const page = await Page.findOne({ stream: stream, level: level, deletedAt: null, status: "active" });
      return page;
    }
    catch (error) {
      throw error;
    }
  }


  async getAllByInstitute(instituteId) {
    try {
      console.log('id',instituteId);
      const pages = await Page.find({ instituteId:instituteId });
      console.log(pages);
      return pages;
    } catch (error) {
      console.error('Error in customPageRepository.getAllByInstitute:', error.message);
      throw error;
    }
  }



}

export { CustomPageRepository };
