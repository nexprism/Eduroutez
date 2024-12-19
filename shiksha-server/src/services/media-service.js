import { MediaRepository } from "../repository/index.js";
class MediaService {
  constructor() {
    this.mediaRepository = new MediaRepository();
  }

  async create(data) {
    try {
      const Media = await this.mediaRepository.create(data);
      return Media;
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
      const Medias = await this.mediaRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return Medias;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the blog category", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const Media = await this.mediaRepository.get(id);
    return Media;
  }

  async update(id, data) {
    try {
      const Media = await this.mediaRepository.update(id, data);

      return Media;
    } catch (error) {
      throw new AppError("Cannot update the blog category ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const Media = await this.mediaRepository.destroy(id);
      return Media;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The blog category you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the blog category ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default MediaService;
