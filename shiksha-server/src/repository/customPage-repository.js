import Page from "../models/CustomPage.js"
import CrudRepository from "./crud-repository.js";

class CustomPageRepository extends CrudRepository {
  constructor() {
    super(Page);
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
