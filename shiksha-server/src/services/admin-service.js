import { ServerConfig } from "../config/index.js";
import { AdminRepository } from "../repository/index.js";
import bcrypt from "bcrypt";

class AdminService {
  constructor() {
    this.adminRepository = new AdminRepository();
  }

  hashPassword(password) {
    const salt = bcrypt.genSaltSync(+ServerConfig.SALT);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }

  async create(data) {
    try {
      if (data.password) {
        data.password = this.hashPassword(data.password);
      }
      const admin = await this.adminRepository.create(data);
      return admin;
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
      // const admins = await this.adminRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);
      const admins = await this.adminRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return admins;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the admins", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async get(id) {
    const admin = await this.adminRepository.get(id);
    return admin;
  }
  async update(id, data) {
    try {
      const admin = await this.adminRepository.update(id, data);
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const admin = await this.adminRepository.destroy(id);
      return admin;
    } catch (error) {
      throw error;
    }
  }
}

export default AdminService;
