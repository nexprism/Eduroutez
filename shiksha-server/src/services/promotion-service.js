import { PromotionRepository } from "../repository/index.js";
import PromotionTransaction from "../models/PromotionTransaction.js";

class PromotionService {
  constructor() {
    this.promotionRepository = new PromotionRepository();
  }

  async create(data) {
    try {
      const promotion = await this.promotionRepository.create(data);

      //save PromotionTransaction in PromotionTransaction collection
      const promotionTransaction = new PromotionTransaction({
        instituteId: promotion.institute,
        location: promotion.location,
        promotionId: promotion._id,
        amount: data.amount,
        remarks: 'Promotion purchase for ' + promotion.location,
        status: 'COMPLETED',
        paymentId: data.paymentId
      });
      
      return promotion;
    } catch (error) {
      throw error;
    }
  }
  async get(id) {
    const promotion = await this.promotionRepository.get(id);
    return promotion;
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
      // const populateFields = ["createdBy"];
      const promotions = await this.promotionRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return promotions;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the promotions", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async update(id, data) {
    try {
      const promotion = await this.promotionRepository.update(id, data);
      return promotion;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const promotion = await this.promotionRepository.destroy(id);
      return promotion;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The promotion you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the promotion ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default PromotionService;

/*
    this is my #first #tweet . I am really #excited
*/
