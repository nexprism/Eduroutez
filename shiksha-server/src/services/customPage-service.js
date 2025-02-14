
import { CustomPageRepository } from "../repository/customPage-repository.js";

class CustomPageService {
  constructor() {
    this.customPageRepository = new CustomPageRepository();
  }

  async create(data) {
    try {
      const page = await this.customPageRepository.create(data);
      return page;
    } catch (error) {
      throw error;
    }
  }
  async get(id) {
    const page = await this.customPageRepository.get(id);
    return page;
  }
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

      // Parse JSON strings from query parameters to objects
      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      // Build filter conditions for multiple fields
    const filterConditions = { deletedAt: null };

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
      const pages = await this.customPageRepository.getAll(
        filterConditions,
        sortConditions,
        pageNum,
        limitNum
      );

      return pages;
    } catch (error) {
      console.log(error);
      throw new AppError(
        "Cannot fetch data of all the pages",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllByInstitute(instituteId) {
    try {
      const page = await this.customPageRepository.getAllByInstitute(instituteId);
      return page;
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const page = await this.customPageRepository.update(id, data);
      return page;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const page = await this.customPageRepository.destroy(id);
      return page;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError(
          "The Page you requested to delete is not present",
          error.statusCode
        );
      }
      throw new AppError(
        "Cannot delete the page ",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default CustomPageService;

/*
    this is my #first #tweet . I am really #excited
*/
