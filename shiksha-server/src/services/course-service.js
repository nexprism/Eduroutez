
import { CourseRepository } from "../repository/index.js";
import { StudentRepository } from "../repository/index.js";
import { StatusCodes } from "http-status-codes";
class CourseService {
  constructor() {
    this.courseRepository = new CourseRepository();
    this.studentRepository = new StudentRepository();
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
    //update views by 1
    const views = course.views + 1;
    await this.courseRepository.update(id, { views });

    if (!course) {
      return null;
    }

    const careerCopy = JSON.parse(JSON.stringify(course));

    if (careerCopy.reviews && Array.isArray(careerCopy.reviews) && careerCopy.reviews.length > 0) {
      try {
        console.log("Processing reviews:", careerCopy.reviews);
        careerCopy.reviews = await Promise.all(
          careerCopy.reviews.map(async (review) => {
            if (!review || !review.studentId) {
              return {
                _id: review?._id || null,
                rating: review?.rating || 0,
                comment: review?.comment || "",
                studentId: null,
                studentName: "Unknown",
                studentEmail: "Unknown"
              };
            }

            try {
              // console.log("Fetching stud  ent:", review.studentId);
              const student = await await this.studentRepository.get(review.studentId);
              // console.log("Student drftyguhj:", student);
              return {
                _id: review._id,
                rating: review.rating,
                comment: review.comment,
                studentId: review.studentId,
                studentName: student?.name || "Unknown",
                studentEmail: student?.email || "Unknown"
              };
            } catch (err) {
              console.error("Error fetching student:", err.message);
              return {
                _id: review._id,
                rating: review.rating,
                comment: review.comment,
                studentId: review.studentId,
                studentName: "Unknown",
                studentEmail: "Unknown"
              };
            }
          })
        );
      } catch (err) {
        console.error("Error processing reviews:", err);
        careerCopy.reviews = [];
      }
    } else {
      console.log("Career reviews not found, not an array, or empty - initializing as empty array");
      careerCopy.reviews = [];
    }
    // console.log("Career cobnhmjpy:", careerCopy);

    return careerCopy;
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
