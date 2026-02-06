import { StreamRepository } from "../repository/index.js";
import { StatusCodes } from "http-status-codes";
class StreamService {
  constructor() {
    this.streamRepository = new StreamRepository();
  }

  async create(data) {
    try {
      const stream = await this.streamRepository.create(data);
      return stream;
    } catch (error) {
      throw error;
    }
  }
  async getAll(query) {
    try {
      const { page = 1, limit = 100, filters = "{}", searchFields = "{}", sort = "{}" } = query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Parse JSON strings from query parameters to objects
      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      // Build filter conditions for multiple fields
      const filterConditions = {
        $or: [
          { deletedAt: null },
          { deletedAt: { $exists: false } }
        ]
      };

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
      const streams = await this.streamRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return streams;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the streams", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const stream = await this.streamRepository.get(id);
    return stream;
  }

  async update(id, data) {
    try {
      const stream = await this.streamRepository.update(id, data);

      return stream;
    } catch (error) {
      throw new AppError("Cannot update the stream ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const stream = await this.streamRepository.destroy(id);
      return stream;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The stream you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the stream ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default StreamService;
