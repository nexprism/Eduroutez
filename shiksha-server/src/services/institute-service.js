import { StatusCodes } from "http-status-codes";
import { InstituteRepository } from "../repository/index.js";

import AppError from "../utils/errors/app-error.js";
class InstituteService {
  constructor() {
    this.instituteRepository = new InstituteRepository();
  }

  async create(data) {
    try {
      const institute = await this.instituteRepository.create(data);
      return institute;
    } catch (error) {
      throw error;
    }
  }

  async make(email,data){
    try {
      const institute = await this.instituteRepository.make(email,data);
      return institute;
    } catch (error) {
      throw error;
    }
  }

  async Upgrade(email,data){
    try {
      const institute=await this.instituteRepository.upgrade(email,data);
      console.log(institute);
    } catch (error) {
      throw error;
    }
  }
  
  async getAll(query) {
    try {
      const { page = 1, limit = 100000000000000, filters = "{}", searchFields = "{}", sort = "{}" } = query;
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
      const populateFields = ["reviews"];
      const institutes = await this.instituteRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);

      return institutes;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the institutes", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const institute = await this.instituteRepository.get(id);
    return institute;
  }

  async getbyemail(email) {
    const institute = await this.instituteRepository.getByEmail(email);
    return institute;
  }
  

  async addCourses(id,data){
    try {
      const updatesInstitute = await this.instituteRepository.addCourse(id, data);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async addReviews(id,data){
    try {
      const updatesInstitute = await this.instituteRepository.addReview(id, data);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async deleteCourse(instituteId,courseId){
    try {
      const updatesInstitute = await this.instituteRepository.removeCourse(instituteId,courseId);

      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id, data) {
    try {
      const institute = await this.instituteRepository.update(id, data);

      return institute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const institute = await this.instituteRepository.destroy(id);
      return institute;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The institute you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default InstituteService;
