import e from "express";
import { UserRepository } from "../repository/index.js";
import { ReddemHistryRepository } from "../repository/index.js";
class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.reddemHistryRepository = new ReddemHistryRepository();
  }

  async getlist() {
    try {
      const users = await this.userRepository.getALL();
      return users;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async create(data) {
    try {
      const user = await this.userRepository.create(data);
      return user;
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
      const categories = await this.userRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return categories;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

async getCounselors() {
  try {
    // Add role filter for counselors
    const filterConditions = { role: "counselor" };

    // Execute query without sorting and pagination
    const counselors = await this.userRepository.getlist(filterConditions);

    return counselors;
  } catch (error) {
    throw new AppError("Cannot fetch data of all the counselors", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

}

export default UserService;

/*
    this is my #first #tweet . I am really #excited
*/
