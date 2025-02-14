import { LevelRepository } from "../repository/index.js";
class LevelService {
  constructor() {
    this.levelRepository = new LevelRepository();
  }

  async create(data) {
    try {
      const level = await this.levelRepository.create(data);
      return level;
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
      const levels = await this.levelRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return levels;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the levels", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const level = await this.levelRepository.get(id);
    return level;
  }

  async update(id, data) {
    try {
      const level = await this.levelRepository.update(id, data);

      return level;
    } catch (error) {
      throw new AppError("Cannot update the level ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const level = await this.levelRepository.destroy(id);
      return level;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The level you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the level ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default LevelService;
