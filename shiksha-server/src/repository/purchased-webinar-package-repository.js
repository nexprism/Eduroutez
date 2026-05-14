import PurchasedWebinarPackage from "../models/PurchasedWebinarPackage.js";
import CrudRepository from "./crud-repository.js";

class PurchasedWebinarPackageRepository extends CrudRepository {
  constructor() {
    super(PurchasedWebinarPackage);
  }

  /**
   * Get purchases by institute
   */
  async getPurchasesByInstitute(instituteId, filters = {}) {
    try {
      return await PurchasedWebinarPackage.find({
        instituteId,
        deletedAt: null,
        ...filters,
      })
        .populate("packageId")
        .populate("instituteId")
        .sort({ purchasedAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active purchases for institute
   */
  async getActivePurchases(instituteId) {
    try {
      return await PurchasedWebinarPackage.find({
        instituteId,
        isExpired: false,
        paymentStatus: "completed",
        deletedAt: null,
        expiryDate: { $gt: new Date() },
      })
        .populate("packageId")
        .sort({ expiryDate: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get purchase by ID with populated fields
   */
  async getPurchaseById(id) {
    try {
      return await PurchasedWebinarPackage.findById(id)
        .populate("packageId")
        .populate("instituteId");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get purchases with pagination and filters
   */
  async getPurchasesWithFilters(filters = {}, page = 1, limit = 10, sort = {}) {
    try {
      const skip = (page - 1) * limit;
      const filterConditions = { deletedAt: null, ...filters };

      const purchases = await PurchasedWebinarPackage.find(filterConditions)
        .populate("packageId")
        .populate("instituteId")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await PurchasedWebinarPackage.countDocuments(
        filterConditions
      );

      return {
        data: purchases,
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

  /**
   * Check if institute has available webinars for package
   */
  async hasAvailableWebinars(instituteId, packageId) {
    try {
      const purchase = await PurchasedWebinarPackage.findOne({
        instituteId,
        packageId,
        isExpired: false,
        paymentStatus: "completed",
        deletedAt: null,
      });

      return purchase && purchase.remainingWebinars > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Decrement remaining webinars
   */
  async decrementWebinars(purchaseId, count = 1) {
    try {
      const purchase = await PurchasedWebinarPackage.findById(purchaseId);

      if (!purchase) {
        throw new Error("Purchase not found");
      }

      if (purchase.remainingWebinars < count) {
        throw new Error("Insufficient webinars available");
      }

      purchase.usedWebinars += count;
      purchase.remainingWebinars -= count;

      await purchase.save();
      return purchase;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get purchase statistics for admin
   */
  async getPurchaseStatistics(filters = {}) {
    try {
      return await PurchasedWebinarPackage.aggregate([
        {
          $match: {
            deletedAt: null,
            ...filters,
          },
        },
        {
          $group: {
            _id: "$paymentStatus",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amountPaid" },
          },
        },
      ]);
    } catch (error) {
      throw error;
    }
  }
}

export { PurchasedWebinarPackageRepository };
