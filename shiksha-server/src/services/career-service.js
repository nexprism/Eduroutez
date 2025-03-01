import { CareerRepository } from "../repository/index.js";
import { StudentRepository } from "../repository/index.js";
class CareerService {
  constructor() {
    this.careerRepository = new CareerRepository();
    this.studentRepository = new StudentRepository();
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

      console.log("careers", careers.result);

      //generate slug for each career and save in db
      

      return careers;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the careers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const career = await this.careerRepository.get(id);

    const views = career.views || 0;
    await this.careerRepository.update(id, { views: views + 1 });

    // console.log("Career object type:", typeof career);
    // console.log("Reviews property exists:", career.hasOwnProperty('reviews'));

    if (!career) {
      return null;
    }

    const careerCopy = JSON.parse(JSON.stringify(career));

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
