
import { CourseCategoryRepository } from "../repository/index.js";
class CourseCategoryService {
  constructor() {
    this.courseCategoryRepository = new CourseCategoryRepository();
  }

  async create(data) {
    try {
      const courseCategory = await this.courseCategoryRepository.create(data);
      return courseCategory;
    } catch (error) {
      throw error;
    }
  }
  async getAll(query) {
    try {
      const { page = 0, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;
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
      const courseCategories = await this.courseCategoryRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return courseCategories;
    } catch (error) {
      console.log("error", error.message);  
      throw new AppError("Cannot fetch data of all the courseCategories", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const courseCategory = await this.courseCategoryRepository.get(id);
    return courseCategory;
  }

  async update(id, data) {
    try {
      const courseCategory = await this.courseCategoryRepository.update(id, data);

      return courseCategory;
    } catch (error) {
      throw new AppError("Cannot update the courseCategory ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const courseCategory = await this.courseCategoryRepository.destroy(id);
      return courseCategory;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The courseCategory you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the courseCategory ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default CourseCategoryService;

/*
    this is my #first #tweet . I am really #excited
*/
