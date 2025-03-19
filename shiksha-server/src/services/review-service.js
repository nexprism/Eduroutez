import { ReviewRepository } from "../repository/index.js";
import  Institute from "../models/Institute.js";

class ReviewService {
  constructor() {
    this.reviewRepository = new ReviewRepository();
    
  }

  async create(data) {
    try {
      const review = await this.reviewRepository.create(data);
      return review;
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
    const filterConditions = { deletedAt: null };

      for (const [key, value] of Object.entries(parsedFilters)) {
        if (parsedFilters.category !== "by-category") {
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
      // const populateFields = ["createdBy", "category"];
      // const reviews = await this.reviewRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);
      const reviews = await this.reviewRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      // Check if grouping by category is requested
      if (parsedFilters.category === "by-category") {
        const groupedResult = reviews.result.reduce((acc, review) => {
          review.category.forEach((cat) => {
            const categoryName = cat.title; // Make sure this is the correct field for the category name
            if (categoryName) {
              // Initialize the category array if it doesn't exist
              if (!acc[categoryName]) {
                acc[categoryName] = [];
              }
              // Add the current review to the relevant category array
              acc[categoryName].push(review);
            } else {
              // Handle cases where category title is missing
              if (!acc["undefined"]) {
                acc["undefined"] = [];
              }
              acc["undefined"].push(review);
            }
          });
          return acc;
        }, {});
        return groupedResult;
      }

      for (let i = 0; i < reviews.result.length; i++) {
        // Convert the model to a plain JavaScript object
        if (typeof reviews.result[i].toObject === 'function') {
          reviews.result[i] = reviews.result[i].toObject();
        } else if (typeof reviews.result[i].toJSON === 'function') {
          reviews.result[i] = reviews.result[i].toJSON();
        } else {
          reviews.result[i] = JSON.parse(JSON.stringify(reviews.result[i]));
        }

        if (reviews.result[i].institute) {
          console.log('institute', reviews.result[i].institute);
          const instutiteDetails = await Institute.findOne({ _id: reviews.result[i].institute });
          if (instutiteDetails){
            reviews.result[i].instituteName = instutiteDetails?.instituteName || 'Super Admin';
          }
        } else {
          reviews.result[i].instituteName = 'Super Admin';
        }
      }
      
      return reviews;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the reviews", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async get(id) {
    const review = await this.reviewRepository.get(id);
    return review;
  }
  async getall(){
    const review = await this.reviewRepository.getALL();
    return review;
  }
  
  async update(id, data) {
    try {
      const review = await this.reviewRepository.update(id, data);
      return review;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const review = await this.reviewRepository.destroy(id);
      return review;
    } catch (error) {
      throw error;
    }
  }

  //getReviewsByInstitute
  async getReviewsByInstitute(instituteId) {
    try {
      const reviews = await this.reviewRepository.getAllByInstitute(instituteId);
      return reviews;
    } catch (error) {
      throw error;
    }
  }

  //getMyReviews
  async getMyReviews(user, type) {
    try {
      const reviews = await this.reviewRepository.getMyReviews(user, type);
      return reviews;
    } catch (error) {
      throw error;
    }
  }


  async getReviewsByUser(email) {
    try {
      const reviews = await this.reviewRepository.getAllByUser(email);
      return reviews;
    } catch (error) {
      throw error;
    }
  }
}



export default ReviewService;

/*
    this is my #first #tweet . I am really #excited
*/
