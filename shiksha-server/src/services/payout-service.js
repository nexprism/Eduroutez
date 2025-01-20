import { PayoutRepository } from "../repository/index.js";
import AppError from "../utils/errors/app-error.js"
import { StatusCodes } from "http-status-codes";
class PayoutService {
  constructor() {
    this.payoutRepository = new PayoutRepository();
  }

  async create(data) {
    try {
      const payout = await this.payoutRepository.create(data);
      return payout;
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

      const populateFields = ["user"];
      // const categories = await this.payoutRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);
      const categories = await this.payoutRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return categories;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the categories", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //getAllByUser
  async getAllByUser(userId) {
    try {
      const filterConditions = { user: userId };
      // const populateFields = ["user"];
      const payouts = await this.payoutRepository.getAll(filterConditions, {}, 1, 1000);
      return payouts;
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    try {
      const payout = await this.payoutRepository.get(id);
      return payout;
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const payout = await this.payoutRepository.update(id, data);
      return payout;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const payout = await this.payoutRepository.destroy(id);
      return payout;
    } catch (error) {
      throw error;
    }
  }
}

export default PayoutService;

/*
    this is my #first #tweet . I am really #excited
*/
