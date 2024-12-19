import { WishlistRepository } from "../repository/index.js";
class WishlistService {
  constructor() {
    this.wishlistRepository = new WishlistRepository();
  }

  async create(data) {
    try {
      const wishlist = await this.wishlistRepository.create(data);
      return wishlist;
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
      const wishlists = await this.wishlistRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return wishlists;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the wishlists", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const wishlist = await this.wishlistRepository.get(id);
    return wishlist;
  }

  async update(id, data) {
    try {
      const wishlist = await this.wishlistRepository.update(id, data);

      return wishlist;
    } catch (error) {
      throw new AppError("Cannot update the wishlist ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const wishlist = await this.wishlistRepository.destroy(id);
      return wishlist;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The wishlist you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the wishlist ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default WishlistService;
