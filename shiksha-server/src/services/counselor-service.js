import { ServerConfig } from "../config/index.js";
import { courseSchema } from "../models/Course.js";
import { CounselorRepository } from "../repository/index.js";
import { UserRepository } from "../repository/index.js";
import bcrypt from "bcrypt";

class CounselorService {
  constructor() {
    this.counselorRepository = new CounselorRepository();
    this.userRepository = new UserRepository();
  }

  hashPassword(password) {
    const salt = bcrypt.genSaltSync(+ServerConfig.SALT);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }

  async create(data) {
    try {
      const counselor = await this.counselorRepository.create(data);
      return counselor;
    } catch (error) {
      throw error;
    }
  }

  async getAll(query) {
    try {
      const { page = 1, limit = 1000000, filters = "{}", searchFields = "{}", sort = "{}" } = query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Parse JSON strings from query parameters to objects
      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      // Build filter conditions for multiple fields
      const filterConditions = {};

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
      const populateFields = [];
      const counselors = await this.counselorRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);

      return counselors;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the counselors", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async get(email) {
    
    const counselor = await this.counselorRepository.get(email);

    console.log('counselor',counselor);

    if(!counselor) {
      //find in user by email
      const user = await this.userRepository.get(email);
      if(user) {
        
        //create counselor
        const counselor = await this.create({userId:user._id,email:user.email,firstname:user.name,lastname:user.lastname});
      }
    }
    return counselor;



  }

  //getByCategory
  async getByCategory(category) {
    try {
      const counselors = await this.counselorRepository.getByCategory(category);
      return counselors;
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    
    const counselor = await this.counselorRepository.getByid(id);

    console.log('counselor', counselor);

    if (!counselor) {
      //find in user by email
      const user = await this.userRepository.getById(id);
      if (user) {

        //create counselor
        const counselor = await this.create({ userId: user._id, email: user.email, firstname: user.name, lastname: user.lastname });
      }
    }
    return counselor;



  }

  
  async getByEmail(email) {
    // console.log('email',email);
    const counselor = await this.counselorRepository.getByEmail(email);
    return counselor;
  }

  async book(email,data) {
    // console.log('hi',email,data);
    const questionAnswer = await this.counselorRepository.book(email,data);
    return questionAnswer;
  }

  //getCounselorsByInstitute
  async getCounselorsByInstitute(instituteId) {
    try {
      const counselors = await this.counselorRepository.getCounselorsByInstitute(instituteId);
      console.log('counselors',counselors);
      return counselors;
    } catch (error) {
      throw error;
    }
  }


  async mark(data) {
    // console.log('hi',email,data);
    const questionAnswer = await this.counselorRepository.mark(data);
    return questionAnswer;
  }

  async update(id, data) {
    try {

      //fetch counselor by id
      console.log('id', id);
      console.log('data', data);
     

      const counselor = await this.counselorRepository.updateCounsellor(id, data);
      return counselor;
    } catch (error) {
      console.log('error', error.message);
      throw error;
    }
  }

  //submitReview
  async submitReview(id, data) {
    try {

      //get counselor by email
      const counselor = await this.counselorRepository.getByid(id);
      console.log('data',data);

      //submit review
      const reviews = {
        studentEmail: data.studentEmail,
        comment: data.comment,
        rating: data.rating,
        counselorId: data.counselorId,
        date: Date.now(),
      }

      // console.log('reviews',reviews);
      
      console.log('counselor', counselor);

      counselor.reviews.push(reviews);

      const review = await counselor.save();


      return counselor
      
      
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const counselor = await this.counselorRepository.destroy(id);
      return counselor;
    } catch (error) {
      throw error;
    }
  }
}

export default CounselorService;

/*
    this is my #first #tweet . I am really #excited
*/
