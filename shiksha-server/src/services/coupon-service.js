import { CouponRepository } from "../repository/index.js";

class CouponService {
  constructor() {
    this.couponRepository = new CouponRepository();
  }

  async create(data) {
    try {
      const coupon = await this.couponRepository.create(data);
      return coupon;
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
    const filterConditions = { deletedAt: null };

      for (const [key, value] of Object.entries(parsedFilters)) {
        if (parsedFilters.category !== "by-category") {
          filterConditions[key] = value;
        }
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
      const populateFields = ["createdBy", "category"];
      const coupons = await this.couponRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);

      // Check if grouping by category is requested
      if (parsedFilters.category === "by-category") {
        const groupedResult = coupons.result.reduce((acc, coupon) => {
          coupon.category.forEach((cat) => {
            const categoryName = cat.title; // Make sure this is the correct field for the category name
            if (categoryName) {
              // Initialize the category array if it doesn't exist
              if (!acc[categoryName]) {
                acc[categoryName] = [];
              }
              // Add the current coupon to the relevant category array
              acc[categoryName].push(coupon);
            } else {
              // Handle cases where category title is missing
              if (!acc["undefined"]) {
                acc["undefined"] = [];
              }
              acc["undefined"].push(coupon);
            }
          });
          return acc;
        }, {});
        return groupedResult;
      }
      return coupons;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the coupons", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async get(id) {
    const coupon = await this.couponRepository.get(id);
    return coupon;
  }
  async update(id, data) {
    try {
      const coupon = await this.couponRepository.update(id, data);
      return coupon;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const coupon = await this.couponRepository.destroy(id);
      return coupon;
    } catch (error) {
      throw error;
    }
  }
}

export default CouponService;

/*
    this is my #first #tweet . I am really #excited
*/
