import { BlogRepository } from "../repository/index.js";
import AppError from "../utils/errors/app-error.js";
import { StudentRepository } from "../repository/index.js";
import { StatusCodes } from "http-status-codes";

class BlogService {
  constructor() {
    this.blogRepository = new BlogRepository();
    this.studentRepository = new StudentRepository();
  }

  async create(data) {
    try {
      const blog = await this.blogRepository.create(data);
      return blog;
    } catch (error) {
      throw error;
    }
  }
  async get(id,field = '_id') {
    const blog = await this.blogRepository.getByField(id,field);
    //update views by 1
    const views = blog.views + 1;
    console.log('views',views);
    await this.blogRepository.update(blog._id, { views });
    if (!blog) {
      return null;
    }

    const careerCopy = JSON.parse(JSON.stringify(blog));
    if (careerCopy.reviews && Array.isArray(careerCopy.reviews) && careerCopy.reviews.length > 0) {
      try {
        // console.log("Processing reviews:", careerCopy.reviews);
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
              console.log("Student drftyguhj:", student);
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
        console.error("Error processing reviews:", err.message);
        careerCopy.reviews = [];
      }
    } else {
      console.log("Career reviews not found, not an array, or empty - initializing as empty array");
      careerCopy.reviews = [];
    }
    // console.log("Career cobnhmjpy:", careerCopy);

    return careerCopy;
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

      console.log("filterConditions", filterConditions);

      // Execute query with dynamic filters, sorting, and pagination
      // const populateFields = ["createdBy"];
      const blogs = await this.blogRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return blogs;
    } catch (error) {
      console.log('error on course', error.message);
      throw new AppError("Cannot fetch data of all the blogs", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


//getAllBlos

async getAllBlogs() {
  try {
    const blogs = await this.blogRepository.getAll();
    return blogs;
  }
  catch (error) {
    console.log(error);
    throw new AppError("Cannot fetch data of all the blogs", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}




   async getAllByInstitute(instituteId) {
    try {
      const blogs = await this.blogRepository.getAllByInstitute(instituteId);
      return blogs;
    } catch (error) {
      throw error;
    }
  }
  
  async update(id, data) {
    try {
      const blog = await this.blogRepository.update(id, data);
      return blog;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const blog = await this.blogRepository.destroy(id);
      return blog;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The blog you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the blog ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default BlogService;

/*
    this is my #first #tweet . I am really #excited
*/
