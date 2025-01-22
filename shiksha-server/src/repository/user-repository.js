import User from "../models/User.js";
import CrudRepository from "./crud-repository.js";

class UserRepository extends CrudRepository {
  constructor() {
    super(User);
  }

  async get(id) {
    const student = await User.findById(id).populate("plan", "refer_by");
    return student;
  }

  async findBy(data) {
    try {
      const response = await User.findOne(data).populate("plan", "refer_by");
      return response;
    } catch (error) {
      throw error;
    }
  }

  // getAll tieht .populate('refer_by')
  async getAll(query) {
    try {
      const response = await User.find(query).populate("refer_by, plan");
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export { UserRepository };
