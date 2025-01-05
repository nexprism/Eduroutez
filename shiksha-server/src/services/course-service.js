
import { CourseRepository } from "../repository/index.js";
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
      const courses = await this.courseRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return courses;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the courses", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //getPopularCourses
  async getPopularCourses() {
    try {
      const courses = await this.courseRepository.getPopularCourses();
      return courses;
    } catch (error) {
      throw new AppError("Cannot fetch popular courses", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  

  async get(id) {
    const course = await this.courseRepository.get(id);
    return course;
  }

  async update(id, data) {
    try {
      const course = await this.courseRepository.update(id, data);

      return course;
    } catch (error) {
      throw new AppError("Cannot update the course ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const course = await this.courseRepository.destroy(id);
      return course;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The course you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the course ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default CourseService;

/*
    this is my #first #tweet . I am really #excited
*/
