import { PurchasedWebinarPackageRepository, WebinarPackageRepository } from "../repository/index.js";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

class PurchasedWebinarPackageService {
  constructor() {
    this.purchasedRepository = new PurchasedWebinarPackageRepository();
    this.packageRepository = new WebinarPackageRepository();
  }

  /**
   * Create purchase (Institute purchases a package)
   */
  async createPurchase(user, data) {
    try {
      // Validation
      if (!data.packageId || !data.amountPaid || !data.expiryDate) {
        throw new AppError(
          "Required fields: packageId, amountPaid, expiryDate",
          StatusCodes.BAD_REQUEST
        );
      }

      // Verify package exists
      const packageData = await this.packageRepository.get(data.packageId);
      if (!packageData) {
        throw new AppError(
          "Package not found",
          StatusCodes.NOT_FOUND
        );
      }

      // Validate expiry date is in future
      if (new Date(data.expiryDate) <= new Date()) {
        throw new AppError(
          "Expiry date must be in the future",
          StatusCodes.BAD_REQUEST
        );
      }

      const purchaseData = {
        instituteId: user._id,
        packageId: data.packageId,
        webinarLimit: packageData.webinarCount,
        usedWebinars: 0,
        remainingWebinars: packageData.webinarCount,
        amountPaid: data.amountPaid,
        paymentStatus: data.paymentStatus || "pending",
        transactionId: data.transactionId || null,
        expiryDate: new Date(data.expiryDate),
        notes: data.notes || "",
      };

      const newPurchase = await this.purchasedRepository.create(purchaseData);
      return newPurchase;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error creating purchase",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get purchase by ID
   */
  async getPurchase(id) {
    try {
      const purchase = await this.purchasedRepository.getPurchaseById(id);

      if (!purchase) {
        throw new AppError(
          "Purchase not found",
          StatusCodes.NOT_FOUND
        );
      }

      return purchase;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error fetching purchase",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get all purchases with filters
   */
  async getAllPurchases(query) {
    try {
      const {
        page = 1,
        limit = 10,
        filters = "{}",
        sort = "{}",
      } = query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const parsedFilters = JSON.parse(filters);
      const parsedSort = JSON.parse(sort);

      const filterConditions = { deletedAt: null, ...parsedFilters };

      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }

      return await this.purchasedRepository.getPurchasesWithFilters(
        filterConditions,
        pageNum,
        limitNum,
        sortConditions
      );
    } catch (error) {
      throw new AppError(
        error.message || "Error fetching purchases",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get institute's purchases
   */
  async getInstitutePurchases(instituteId, query = {}) {
    try {
      const { page = 1, limit = 10, onlyActive = false } = query;

      if (onlyActive) {
        const activePurchases = await this.purchasedRepository.getActivePurchases(instituteId);
        return activePurchases;
      }

      const filters = { instituteId };
      return await this.purchasedRepository.getPurchasesWithFilters(
        filters,
        parseInt(page),
        parseInt(limit),
        { purchasedAt: -1 }
      );
    } catch (error) {
      throw new AppError(
        error.message || "Error fetching institute purchases",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update purchase
   */
  async updatePurchase(id, data) {
    try {
      const purchase = await this.purchasedRepository.get(id);

      if (!purchase) {
        throw new AppError(
          "Purchase not found",
          StatusCodes.NOT_FOUND
        );
      }

      const updatedPurchase = await this.purchasedRepository.update(id, data);
      return updatedPurchase;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error updating purchase",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete purchase (soft delete)
   */
  async deletePurchase(id) {
    try {
      const purchase = await this.purchasedRepository.get(id);

      if (!purchase) {
        throw new AppError(
          "Purchase not found",
          StatusCodes.NOT_FOUND
        );
      }

      const deletedPurchase = await this.purchasedRepository.update(id, {
        deletedAt: new Date(),
      });

      return deletedPurchase;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error deleting purchase",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Use webinar from package
   */
  async useWebinar(purchaseId, count = 1) {
    try {
      const purchase = await this.purchasedRepository.getPurchaseById(purchaseId);

      if (!purchase) {
        throw new AppError(
          "Purchase not found",
          StatusCodes.NOT_FOUND
        );
      }

      // Check if purchase is active
      if (purchase.isExpired) {
        throw new AppError(
          "Purchase has expired",
          StatusCodes.BAD_REQUEST
        );
      }

      if (purchase.paymentStatus !== "completed") {
        throw new AppError(
          "Payment not completed",
          StatusCodes.BAD_REQUEST
        );
      }

      if (purchase.remainingWebinars < count) {
        throw new AppError(
          `Insufficient webinars. Only ${purchase.remainingWebinars} remaining`,
          StatusCodes.BAD_REQUEST
        );
      }

      // Decrement webinars
      const updatedPurchase = await this.purchasedRepository.decrementWebinars(
        purchaseId,
        count
      );

      return updatedPurchase;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error using webinar",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Confirm payment for purchase
   */
  async confirmPayment(purchaseId, transactionId) {
    try {
      const purchase = await this.purchasedRepository.get(purchaseId);

      if (!purchase) {
        throw new AppError(
          "Purchase not found",
          StatusCodes.NOT_FOUND
        );
      }

      const updatedPurchase = await this.purchasedRepository.update(purchaseId, {
        paymentStatus: "completed",
        transactionId,
      });

      return updatedPurchase;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error.message || "Error confirming payment",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get purchase statistics
   */
  async getPurchaseStats(filters = {}) {
    try {
      return await this.purchasedRepository.getPurchaseStatistics(filters);
    } catch (error) {
      throw new AppError(
        error.message || "Error fetching statistics",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Check if institute can use webinar
   */
  async canUseWebinar(instituteId, packageId) {
    try {
      return await this.purchasedRepository.hasAvailableWebinars(instituteId, packageId);
    } catch (error) {
      throw new AppError(
        error.message || "Error checking webinar availability",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default PurchasedWebinarPackageService;
