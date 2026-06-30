import Activity from "../models/Activity.js";
import CrudRepository from "./crud-repository.js";

class ActivityRepository extends CrudRepository {
  constructor() {
    super(Activity);
  }

  async getUserActivity(userId, limit = 20, skip = 0) {
    return Activity.find({ user: userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countUserActivity(userId) {
    return Activity.countDocuments({ user: userId, deletedAt: null });
  }

  async getRecentActivity(userId, limit = 10) {
    return Activity.find({ user: userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

export { ActivityRepository };
