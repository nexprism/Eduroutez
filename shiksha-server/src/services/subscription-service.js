import { SubscriptionRepository } from "../repository/index.js";
class SubscriptionService {
  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async create(data) {
    try {
      const subscription = await this.subscriptionRepository.create(data);
      return subscription;
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
      const subscriptions = await this.subscriptionRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return subscriptions;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the subscriptions", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const subscription = await this.subscriptionRepository.get(id);
    return subscription;
  }

  async update(id, data) {
    try {
      const subscription = await this.subscriptionRepository.update(id, data);

      return subscription;
    } catch (error) {
      throw new AppError("Cannot update the subscription ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const subscription = await this.subscriptionRepository.destroy(id);
      return subscription;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The subscription you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the subscription ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default SubscriptionService;
