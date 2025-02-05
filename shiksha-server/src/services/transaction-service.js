import { populate } from "dotenv";
import { TransactionRepository } from "../repository/index.js";

class TransactionService {
  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  async create(data) {
    try {
      const transaction = await this.transactionRepository.create(data);
      return transaction;
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

      const populateFields = ["user","subscription"];
      const categories = await this.transactionRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);

      return categories;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the categories", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default TransactionService;

/*
    this is my #first #tweet . I am really #excited
*/
