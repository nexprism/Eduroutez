import { CareerCategoryRepository } from "../repository/index.js";
class CareerCategoryService {
  constructor() {
    this.careerCategoryRepository = new CareerCategoryRepository();
  }

  async create(data) {
    try {
      const careerCategory = await this.careerCategoryRepository.create(data);
      return careerCategory;
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
      const careerCategories = await this.careerCategoryRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return careerCategories;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the career category", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const careerCategory = await this.careerCategoryRepository.get(id);
    return careerCategory;
  }

  async update(id, data) {
    try {
      const careerCategory = await this.careerCategoryRepository.update(id, data);

      return careerCategory;
    } catch (error) {
      throw new AppError("Cannot update the career category ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const careerCategory = await this.careerCategoryRepository.destroy(id);
      return careerCategory;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The career category you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the career category ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default CareerCategoryService;
