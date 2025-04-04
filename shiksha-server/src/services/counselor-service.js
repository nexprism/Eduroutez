import { ServerConfig } from "../config/index.js";
import { courseSchema } from "../models/Course.js";
import { CounselorRepository } from "../repository/index.js";
import { UserRepository } from "../repository/index.js";
import  ScheduleSlot  from "../models/ScheduleSlots.js";
import  User  from "../models/User.js";
import  { CounselorSlotRepository }  from "../repository/counselorSlot-repository.js";
import bcrypt from "bcrypt";
import Counselor from "../models/Counselor.js";

class CounselorService {
  constructor() {
    this.counselorRepository = new CounselorRepository();
    this.userRepository = new UserRepository();
    this.counselorSlotRepository = new CounselorSlotRepository();
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
      const populateFields = [];
      const counselors = await this.counselorRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);

      for (let i = 0; i < counselors.result.length; i++) {
        // Convert the model to a plain JavaScript object
        if (typeof counselors.result[i].toObject === 'function') {
          counselors.result[i] = counselors.result[i].toObject();
        } else if (typeof counselors.result[i].toJSON === 'function') {
          counselors.result[i] = counselors.result[i].toJSON();
        } else {
          counselors.result[i] = JSON.parse(JSON.stringify(counselors.result[i]));
        }

        //find in user by counselors.result[i]._id
        console.log('counselors.result[i]._id',counselors.result[i]._id);
        const user = await User.findOne({ _id: counselors.result[i]._id });
        if(user) {
          counselors.result[i].level = user.level;
          counselors.result[i].points = user.points;
          counselors.result[i].balance = user.balance;
        }
       
        

        //get all schedules slots of counselor
        const schedules = await ScheduleSlot.find({ counselorId:counselors.result[i]._id});
        if(schedules) {
          counselors.result[i].schedules = schedules.length;
        }else{
          counselors.result[i].schedules = 0;
        }

        //get all slots from counselorSlot model
        const slots = await this.counselorSlotRepository.get(counselors.result[i].email);
        console.log('slots',slots);
        if(slots) {
          counselors.result[i].slots = slots;
        }


      }

      return counselors;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the counselors", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async get(email) {
    
    const counselor = await this.counselorRepository.get(email);

    // console.log('counselor',counselor);

    if(!counselor) {
      //find in user by email
      const user = await this.userRepository.get(email);
      console.log('counselor user',user);
      if(user) {
        
        //create counselor
        const counselor = await this.create({userId:user._id,email:user.email,firstname:user.name,lastname:user.lastname});
      }
    }

    const userResponse = await this.userRepository.getById(counselor[0]._id);
    if(userResponse) {
      counselor[0].level = userResponse.level;
      counselor[0].points = userResponse.points;
    }

    if (counselor[0].reviews.length > 0) {

      //push student object into reviews array
      counselor[0].reviews.forEach((review) => {
        // const totalRating = counselor[0].reviews.reduce((acc, review) => acc + review.rating, 0);

        //get student by email
        const student =  this.userRepository.get(review.studentEmail);
        console.log('review student',student);
        review.student = student;
      });

      
      console.log('counselor[0].reviews',counselor[0].reviews);
      
      // counselor[0].avgrating = totalRating / counselor[0].reviews.length;
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

  async book(id,data) {
    // console.log('hi',email,data);
    try{
    const questionAnswer = await this.counselorRepository.book(id,data);
    
    return questionAnswer;
    }catch(error){
      console.log('error ',error.message);
      throw error;
    };
  }

  //getCounselorsByInstitute
  async getCounselorsByInstitute(instituteId, query) {
    try {
      
        const { page = 1, limit = 1000000, filters = "{}", searchFields = "{}", sort = "{}" } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Parse JSON strings from query parameters to objects
        const parsedFilters = JSON.parse(filters);
        const parsedSearchFields = JSON.parse(searchFields);
        const parsedSort = JSON.parse(sort);

        // Build filter conditions for multiple fields
      const filterConditions = { deletedAt: null };
        filterConditions.instituteId = instituteId;

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

  //updateBalance
  async updateBalance(id, data) {
    try {
      const counselor = await Counselor.findById(id);
      counselor.balance = data.balance;
      const updatedCounselor = await counselor.save();
      return updatedCounselor;
    } catch (error) {
      throw error;
    }
  }



  async update(id, data) {
    try {

      //fetch counselor by id
      // console.log('id', id);
      // console.log('data', data);
     

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
      const user = await this.userRepository.destroy(id);
      

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
