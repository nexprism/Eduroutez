import WebinarPackage from "../models/WebinarPackage.js";
import CrudRepository from "./crud-repository.js";

class WebinarPackageRepository extends CrudRepository {
  constructor() {
    super(WebinarPackage);
  }

  /**
   * Get active packages within date range
   */
  async getActivePackages(filters = {}) {
    try {
      return await WebinarPackage.find({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        deletedAt: null,
        ...filters,
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get packages by creator
   */
  async getPackagesByCreator(createdBy) {
    try {
      return await WebinarPackage.find({
        createdBy,
        deletedAt: null,
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get packages with pagination and filters
   */
  async getPackagesWithFilters(filters = {}, page = 1, limit = 10, sort = {}) {
    try {
      const skip = (page - 1) * limit;
      const filterConditions = { deletedAt: null, ...filters };

      const packages = await WebinarPackage.find(filterConditions)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await WebinarPackage.countDocuments(filterConditions);

      return {
        data: packages,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

export { WebinarPackageRepository };
