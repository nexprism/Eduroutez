import { RoleRepository } from "../repository/index.js";

class RoleService {
  constructor() {
    this.roleRepository = new RoleRepository();
  }

  async create(data) {
    try {
      const role = await this.roleRepository.create(data);
      return role;
    } catch (error) {
      throw error;
    }
  }
  async get(id) {
    const role = await this.roleRepository.get(id);
    return role;
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
      // const populateFields = ["createdBy"];
      const roles = await this.roleRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return roles;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the roles", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async update(id, data) {
    try {
      const role = await this.roleRepository.update(id, data);
      return role;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const role = await this.roleRepository.destroy(id);
      return role;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The role you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the role ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default RoleService;
