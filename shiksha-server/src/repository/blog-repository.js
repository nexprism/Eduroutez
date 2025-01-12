import Blog from "../models/Blog.js";
import CrudRepository from "./crud-repository.js";

class BlogRepository extends CrudRepository {
  constructor() {
    super(Blog);
  }

  //getall()
  async getAll() {
    try {
      const blogs = await Blog.find();
      return blogs;
    } catch (error) {
      console.error('Error in BlogRepository.getAll:', error.message);
      throw error;
    }
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



}

export { BlogRepository };
