import { FeedbackRepository } from "../repository/index.js";
class FeedbackService {
  constructor() {
    this.feedbackRepository = new FeedbackRepository();
  }

  async create(data) {
    try {
      const feedback = await this.feedbackRepository.create(data);
      return feedback;
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
      const feedbacks = await this.feedbackRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return feedbacks;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the feedbacks", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const feedback = await this.feedbackRepository.get(id);
    return feedback;
  }

  async update(id, data) {
    try {
      const feedback = await this.feedbackRepository.update(id, data);

      return feedback;
    } catch (error) {
      throw new AppError("Cannot update the feedback ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const feedback = await this.feedbackRepository.destroy(id);
      return feedback;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The feedback you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the feedback ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default FeedbackService;
