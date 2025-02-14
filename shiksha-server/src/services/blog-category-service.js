import { BlogCategoryRepository } from "../repository/index.js";
class BlogCategoryService {
  constructor() {
    this.blogCategoryRepository = new BlogCategoryRepository();
  }

  async create(data) {
    try {
      const blogCategory = await this.blogCategoryRepository.create(data);
      return blogCategory;
    } catch (error) {
      throw error;
    }
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
    const filterConditions = { deletedAt: null };

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
      const blogCategories = await this.blogCategoryRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return blogCategories;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the blog category", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const blogCategory = await this.blogCategoryRepository.get(id);
    return blogCategory;
  }

  async update(id, data) {
    try {
      const blogCategory = await this.blogCategoryRepository.update(id, data);

      return blogCategory;
    } catch (error) {
      throw new AppError("Cannot update the blog category ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const blogCategory = await this.blogCategoryRepository.destroy(id);
      return blogCategory;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The blog category you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the blog category ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default BlogCategoryService;
