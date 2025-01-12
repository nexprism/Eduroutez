import { BlogRepository } from "../repository/index.js";

class BlogService {
  constructor() {
    this.blogRepository = new BlogRepository();
  }

  async create(data) {
    try {
      const blog = await this.blogRepository.create(data);
      return blog;
    } catch (error) {
      throw error;
    }
  }
  async get(id) {
    const blog = await this.blogRepository.get(id);
    return blog;
  }
  async getAll(query) {
    try {
      const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Parse JSON strings from query parameters to objects
      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      // Build filter conditions for multiple fields
      const filterConditions = {};

      for (const [key, value] of Object.entries(parsedFilters)) {
        filterConditions[key] = value;
      }

      // Build search conditions for multiple fields with partial matching
      const searchConditions = [];
      for (const [field, term] of Object.entries(parsedSearchFields)) {
        searchConditions.push({ [field]: { $regex: term, $options: "i" } });
      }
      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }

      // Build sort conditions
      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }

      // Execute query with dynamic filters, sorting, and pagination
      // const populateFields = ["createdBy"];
      const blogs = await this.blogRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return blogs;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the blogs", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


//getAllBlos

async getAllBlogs() {
  try {
    const blogs = await this.blogRepository.getAll();
    return blogs;
  }
  catch (error) {
    console.log(error);
    throw new AppError("Cannot fetch data of all the blogs", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}




   async getAllByInstitute(instituteId) {
    try {
      const blogs = await this.blogRepository.getAllByInstitute(instituteId);
      return blogs;
    } catch (error) {
      throw error;
    }
  }
  
  async update(id, data) {
    try {
      const blog = await this.blogRepository.update(id, data);
      return blog;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const blog = await this.blogRepository.destroy(id);
      return blog;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The blog you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the blog ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default BlogService;

/*
    this is my #first #tweet . I am really #excited
*/
