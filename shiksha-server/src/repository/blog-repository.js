import Blog from "../models/Blog.js";
import CrudRepository from "./crud-repository.js";

class BlogRepository extends CrudRepository {
  constructor() {
    super(Blog);
  }

  //getall()
  async getAll(filterCon = {}, sortCon = {}, pageNum, limitNum, populateFields = []) {
    let query;
    if (pageNum > 0){
     query = this.model
      .find(filterCon)
      .sort(sortCon)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    }else{
     query = this.model
      .find(filterCon)
      .sort(sortCon);
    }

    // Populate fields if any
    if (populateFields?.length > 0) {
      populateFields?.forEach((field) => {
        query = query.populate(field);
      });
    }
    const result = await query;
    // Get the total count of documents matching the filter
    const totalDocuments = await this.model.countDocuments(filterCon);

    return {
      result,
      currentPage: pageNum,
      totalPages: Math.ceil(totalDocuments / limitNum),
      totalDocuments,
    };
  }


  async getAllByInstitute(instituteId) {
    try {
      console.log('id',instituteId);
      const blogs = await Blog.find({ instituteId:instituteId });
      console.log(blogs);
      return blogs;
    } catch (error) {
      console.error('Error in BlogRepository.getAllByInstitute:', error.message);
      throw error;
    }
  }

  //getByField
  async getByField(value, field) {
    try {
      console.log('field',field);
      console.log('value',value);
      const blog = await Blog.findOne({ [field]: value });
      return blog;
    } catch (error) {
      console.error('Error in BlogRepository.getByField:', error.message);
      throw error;
    }
  }



}

export { BlogRepository };
