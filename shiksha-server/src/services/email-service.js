import { EmailRepository } from "../repository/email-repository.js";


class emailService {
  constructor() {
    this.emailRepository=new EmailRepository();
  }

  escapeRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async create(data) {
    try {
      const email = await this.emailRepository.create(data);
      return email;
    } catch (error) {
      throw error;
    }
  }
  async getAll(query) {
    try {
      const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}", search = "" } = query;
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

      if (search) {
        const escapedSearch = this.escapeRegex(search);
        searchConditions.push(
          { subject: { $regex: escapedSearch, $options: "i" } },
          { templateName: { $regex: escapedSearch, $options: "i" } }
        );
      }

      for (const [field, term] of Object.entries(parsedSearchFields)) {
        const escapedTerm = this.escapeRegex(term);
        searchConditions.push({ [field]: { $regex: escapedTerm, $options: "i" } });
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
      const questionAnswers = await this.emailRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return questionAnswers;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the questionAnswers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const questionAnswer = await this.emailRepository.get(id);
    return questionAnswer;
  }

  async update(id, data) {
    try {
      const questionAnswer = await this.emailRepository.update(id, data);

      return questionAnswer;
    } catch (error) {
      throw new AppError("Cannot update the questionAnswer ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const questionAnswer = await this.emailRepository.destroy(id);
      return questionAnswer;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The questionAnswer you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the questionAnswer ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default emailService;
