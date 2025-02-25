import { CareerRepository } from "../repository/index.js";
class CareerService {
  constructor() {
    this.careerRepository = new CareerRepository();
  }

  async create(data) {
    try {
      const career = await this.careerRepository.create(data);
      return career;
    } catch (error) {
      throw error;
    }
  }

async getCareerByinstituteId(instituteId) {

    try {
      const careers = await this.careerRepository.getCareer(instituteId);
      return careers;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the careers", StatusCodes.INTERNAL_SERVER_ERROR);
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
      const careers = await this.careerRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return careers;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the careers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const career = await this.careerRepository.get(id);
    //update views by 1
    const views = career.views + 1;
    await this.careerRepository.update(id, { views });
    return career;
  }

  async update(id, data) {
    try {

      console.log("career data", data);
      const career = await this.careerRepository.update(id, data);

      return career;
    } catch (error) {
      throw new AppError("Cannot update the career ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const career = await this.careerRepository.destroy(id);
      return career;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The career you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the career ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default CareerService;

/*
    this is my #first #tweet . I am really #excited
*/
