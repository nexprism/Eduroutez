
import { CourseRepository } from "../repository/index.js";
import { StatusCodes } from "http-status-codes";
class CourseService {
  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async create(data) {
    try {
      const course = await this.courseRepository.create(data);
      return course;
    } catch (error) {
      throw error;
    }
  }
  async getAll(query) {
    try {
      const { page = 1, limit = 10000, filters = "{}", searchFields = "{}", sort = "{}" } = query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Parse JSON strings from query parameters to objects
      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      // Build filter conditions for multiple fields
    const filterConditions = { deletedAt: null };

      for (const [key, value] of Object.entries(parsedFilters)) {
        if(value === "true" ) {
          filterConditions[key] =  true;
        }else if(value === "false") {
          filterConditions[key] = false;
        }else {
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

      console.log("filterConditions", filterConditions);
      // Execute query with dynamic filters, sorting, and pagination
      const courses = await this.courseRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return courses;
    } catch (error) {

      throw error;
    }
  }

  //getCourseByInstitute
  async getCourseByInstitute(instituteId) {
    try {
      const courses = await this.courseRepository.getCourseByInstitute(instituteId);
      return courses;
    } catch (error) {
      throw error;
    }
  }

  //getPopularCourses
  async getPopularCourses() {
    try {
      const courses = await this.courseRepository.getPopularCourses();
      return courses;
    } catch (error) {
      throw error;
    }
  }
  

  async get(id) {
    const populateFields = ["category"];
    const course = await this.courseRepository.get(id, populateFields);
    return course;
  }

  async update(id, data) {
    try {
      console.log("data", data);
      const course = await this.courseRepository.update(id, data);

      return course;
    } catch (error) {
      throw error;

        }
  }

  async delete(id) {
    try {
      const course = await this.courseRepository.destroy(id);
      return course;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw error;
      }
      throw error;
    }
  }
}

export default CourseService;

/*
    this is my #first #tweet . I am really #excited
*/
