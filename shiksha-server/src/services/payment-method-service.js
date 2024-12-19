import { PaymentMethodRepository } from "../repository/index.js";
class PaymentMethodService {
  constructor() {
    this.paymentMethodRepository = new PaymentMethodRepository();
  }

  async create(data) {
    try {
      const paymentMethod = await this.paymentMethodRepository.create(data);
      return paymentMethod;
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
      const paymentMethods = await this.paymentMethodRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return paymentMethods;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the payment methods", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const paymentMethod = await this.paymentMethodRepository.get(id);
    return paymentMethod;
  }

  async update(id, data) {
    try {
      const paymentMethod = await this.paymentMethodRepository.update(id, data);

      return paymentMethod;
    } catch (error) {
      throw new AppError("Cannot update the payment method ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const paymentMethod = await this.paymentMethodRepository.destroy(id);
      return paymentMethod;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The payment method you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the payment method ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default PaymentMethodService;

/*
    this is my #first #tweet . I am really #excited
*/
