import { WebinarPackageRepository } from "../repository/index.js";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

class WebinarPackageService {
  constructor() {
    this.webinarPackageRepository = new WebinarPackageRepository();
  }

  /**
   * Create a new webinar package
   */
  async create(user, data) {
    try {
      // Validation
      if (!data.name || !data.webinarCount || !data.salePrice || !data.startDate || !data.endDate) {
        throw new AppError(
          "Required fields: name, webinarCount, salePrice, startDate, endDate",
          StatusCodes.BAD_REQUEST
        );
      }

      if (data.startDate >= data.endDate) {
        throw new AppError(
          "Start date must be before end date",
          StatusCodes.BAD_REQUEST
        );
      }

      if (data.salePrice > data.originalPrice) {
        throw new AppError(
          "Sale price cannot be greater than original price",
          StatusCodes.BAD_REQUEST
        );
      }

      const packageData = {
        ...data,
        createdBy: user._id,
      };

      const newPackage = await this.webinarPackageRepository.create(packageData);
      return newPackage;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error creating package",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get single package by ID
   */
  async get(id) {
    try {
      const packageData = await this.webinarPackageRepository.get(id);

      if (!packageData) {
        throw new AppError(
          "Package not found",
          StatusCodes.NOT_FOUND
        );
      }

      return packageData;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error fetching package",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get all packages with filtering and pagination
   */
  async getAll(query) {
    try {
      const {
        page = 1,
        limit = 10,
        filters = "{}",
        searchFields = "{}",
        sort = "{}",
      } = query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      const filterConditions = { deletedAt: null, ...parsedFilters };

      // Build search conditions for multiple fields
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

      return await this.webinarPackageRepository.getPackagesWithFilters(
        filterConditions,
        pageNum,
        limitNum,
        sortConditions
      );
    } catch (error) {
      throw new AppError(
        error.message || "Error fetching packages",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get active packages
   */
  async getActivePackages() {
    try {
      return await this.webinarPackageRepository.getActivePackages();
    } catch (error) {
      throw new AppError(
        error.message || "Error fetching active packages",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update package
   */
  async update(id, data) {
    try {
      const packageData = await this.webinarPackageRepository.get(id);

      if (!packageData) {
        throw new AppError(
          "Package not found",
          StatusCodes.NOT_FOUND
        );
      }

      // Validation for date update
      if (data.startDate && data.endDate && data.startDate >= data.endDate) {
        throw new AppError(
          "Start date must be before end date",
          StatusCodes.BAD_REQUEST
        );
      }

      if (data.salePrice && data.originalPrice && data.salePrice > data.originalPrice) {
        throw new AppError(
          "Sale price cannot be greater than original price",
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedPackage = await this.webinarPackageRepository.update(id, data);
      return updatedPackage;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error updating package",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete package (soft delete)
   */
  async delete(id) {
    try {
      const packageData = await this.webinarPackageRepository.get(id);

      if (!packageData) {
        throw new AppError(
          "Package not found",
          StatusCodes.NOT_FOUND
        );
      }

      const deletedPackage = await this.webinarPackageRepository.update(id, {
        deletedAt: new Date(),
      });

      return deletedPackage;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error deleting package",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get packages by creator
   */
  async getPackagesByCreator(createdBy) {
    try {
      return await this.webinarPackageRepository.getPackagesByCreator(createdBy);
    } catch (error) {
      throw new AppError(
        error.message || "Error fetching packages",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default WebinarPackageService;
