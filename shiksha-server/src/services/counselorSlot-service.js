import { CounselorSlotRepository } from "../repository/counselorSlot-repository.js";

class questionAnswerService {
  constructor() {
    this.counselorSlotRepository = new CounselorSlotRepository();
  }

  async create(data) {
    try {
      const counselorSlot = await this.counselorSlotRepository.create(data);
      return counselorSlot;
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
      const questionAnswers = await this.questionAnswerRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return questionAnswers;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the questionAnswers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(email) {
    const questionAnswer = await this.counselorSlotRepository.get(email);
    return questionAnswer;
  }

  async update(email, data) {
    try {
      const questionAnswer = await this.counselorSlotRepository.update(email, data);

      return questionAnswer;
    } catch (error) {
      throw new AppError("Cannot update the questionAnswer ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const questionAnswer = await this.questionAnswerRepository.destroy(id);
      return questionAnswer;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The questionAnswer you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the questionAnswer ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default questionAnswerService;
