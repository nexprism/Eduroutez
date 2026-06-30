import { ActivityRepository } from "../repository/index.js";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

class ActivityService {
  constructor() {
    this.activityRepository = new ActivityRepository();
  }

  async logActivity(userId, type, targetType = null, targetId = null, targetName = null, metadata = {}) {
    try {
      const data = { user: userId, type, targetType, targetId, targetName, metadata };
      return await this.activityRepository.create(data);
    } catch (error) {
      console.error("Error logging activity:", error.message);
    }
  }

  async getUserActivity(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const [activities, total] = await Promise.all([
        this.activityRepository.getUserActivity(userId, limit, skip),
        this.activityRepository.countUserActivity(userId),
      ]);
      return { activities, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      throw new AppError("Cannot fetch user activity", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getRecentActivity(userId, limit = 10) {
    try {
      return await this.activityRepository.getRecentActivity(userId, limit);
    } catch (error) {
      throw new AppError("Cannot fetch recent activity", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getActivityStats(userId) {
    try {
      const activities = await this.activityRepository.getUserActivity(userId, 9999, 0);
      const all = activities.activities || activities;
      return {
        total: all.length,
        likes: all.filter((a) => a.type.startsWith("like_")).length,
        wishlists: all.filter((a) => a.type.startsWith("wishlist_") && !a.type.startsWith("unwishlist_")).length,
        reviews: all.filter((a) => a.type.startsWith("review_")).length,
        points: all.filter((a) => a.type.startsWith("points_")).length,
        referrals: all.filter((a) => a.type === "referral_used").length,
      };
    } catch (error) {
      return { total: 0, likes: 0, wishlists: 0, reviews: 0, points: 0, referrals: 0 };
    }
  }
}

export default ActivityService;
