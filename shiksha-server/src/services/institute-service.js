import { StatusCodes } from "http-status-codes";
import { InstituteRepository } from "../repository/index.js";
import { InstituteIssuesRepository } from "../repository/index.js";

import AppError from "../utils/errors/app-error.js";
class InstituteService {
  constructor() {
    this.instituteRepository = new InstituteRepository();
    this.instituteIssuesRepository = new InstituteIssuesRepository();
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

  async addFacility(id,data){
    try {
      console.log('id',id);
      console.log('data',data);
      const updatesInstitute = await this.instituteRepository.addFacility(id, data.title);
console.log('updatesInstitute',updatesInstitute);
      return updatesInstitute;
    } catch (error) {
      console.log(error.message);
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async Upgrade(email,data){
    try {
      const institute=await this.instituteRepository.upgrade(email,data);
      console.log(institute);
    } catch (error) {
      console.log(error.message);
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
        if (value === "true") {
          filterConditions[key] = true;
        } else if (value === "false") {
          filterConditions[key] = false;
        } else {
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

  //bestRatedInstitute
  async bestRatedInstitute() {
    try {
      const institute = await this.instituteRepository.bestRatedInstitute();
      return institute;
    } catch (error) {
      throw new AppError("Cannot fetch best rated institute", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  

//addGallery
  async addGallery(id,data){
    console.log(id);
    console.log('data',data);
    try {
      const updatesInstitute = await this.instituteRepository.addGallery(id, data.gallery);
      return updatesInstitute;
    } catch (error) {
      throw new AppError("Cannot update the institute ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
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

  //updateCourses
  async updateCourses(id,courseId,data){
    try {
      const updatesInstitute = await this.instituteRepository.updateCourse(id,courseId, data);

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

  //submitIssue
  async submitIssue(id,data){
    try {
      
      const payload = { 
        ...data,
        institute: id,
        status: "Pending",
      };

      console.log('data', payload);
      const issue = await this.instituteIssuesRepository.create(payload);
      return issue;
    } catch (error) {
      console.log('error',error.message);
      throw new AppError("Cannot submit the issue ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  
}

export default InstituteService;
