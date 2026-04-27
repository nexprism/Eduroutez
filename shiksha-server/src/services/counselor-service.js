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
      // Ensure counselors created via API are verified if not set
      if (typeof data.isVerified === 'undefined') {
        data.isVerified = true;
      }
      if (!data.verificationStatus) {
        data.verificationStatus = 'verified';
      }
      const counselor = await this.counselorRepository.create(data);
      return counselor;
    } catch (error) {
      throw error;
    }
  }

  async getAll(query) {
    try {
      const { page = 1, limit = 1000000, filters = "{}", searchFields = "{}", sort = "{}", search = "" } = query;
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
      
      // Add top-level search parameter support
      if (search) {
        searchConditions.push({ firstname: { $regex: search, $options: "i" } });
        searchConditions.push({ lastname: { $regex: search, $options: "i" } });
      }

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
        
        // create counselor with all required info from the user record
        const fullName = (user.name || '').trim();
        const parts = fullName.split(/\s+/);
        const firstname = parts.shift() || '';
        const lastname = parts.join(' ') || user.lastname || '';

        const counselor = await this.create({
          _id: user._id, 
          email: user.email, 
          firstname,
          lastname,
          contactno: user.contact_number || '0000000000'
        });
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

        // create counselor with all required info from the user record
        const fullName = (user.name || '').trim();
        const parts = fullName.split(/\s+/);
        const firstname = parts.shift() || '';
        const lastname = parts.join(' ') || user.lastname || '';

        const counselor = await this.create({
          _id: user._id, 
          email: user.email, 
          firstname,
          lastname,
          contactno: user.contact_number || '0000000000'
        });
      }
    }
    return counselor;



  }

  
  async getByEmail(email) {
    // console.log('email',email);
    const counselor = await this.counselorRepository.getByEmail(email);
    return counselor;
  }

  // Schedule a test for counselor (save date/time and send notification email)
  async scheduleTest(counselorId, data) {
    try {
      const { date, slot } = data; // date: YYYY-MM-DD, slot: HH:mm
      if (!date || !slot) throw new Error('Both date and slot are required');
      const scheduledDate = new Date(`${date}T${slot}:00`);

      const payload = {
        scheduledTestDate: scheduledDate,
        scheduledTestSlot: slot,
        scheduledTestReminderSent: false,
        scheduledTestReminder48HourSent: false,
        scheduledTestReminder1DaySent: false,
        scheduledTestReminder1HourSent: false,
        verificationStatus: 'test_scheduled'
      };

      const updatedCounselor = await this.counselorRepository.updateCounsellor(counselorId, payload);

      // Also update the User document so frontend reads scheduled test info from User
      try {
        // Update user model with scheduling info and unset legacy/typo fields
        await User.findByIdAndUpdate(counselorId, {
          $set: {
            scheduledTestDate: scheduledDate,
            scheduledTestSlot: slot,
            scheduledTestReminderSent: false,
            scheduledTestReminder48HourSent: false,
            scheduledTestReminder1DaySent: false,
            scheduledTestReminder1HourSent: false,
          },
          $unset: {
            scheduledTest: "",
            scheduledTestDateString: "",
            scheduledTest1HourReminderSent: ""
          }
        });
      } catch (userUpdateErr) {
        console.error('Failed to update User scheduled test fields:', userUpdateErr?.message || userUpdateErr);
      }
      // Send notification email via internal /send-email route
      try {
        const serverPort = ServerConfig.PORT || 4001;
        const sendEmailUrl = `http://localhost:${serverPort}/send-email`;
        const message = `<p>Dear ${updatedCounselor.firstname || 'Counselor'},</p>
          <p>Your counselor test has been scheduled on <strong>${scheduledDate.toLocaleString()}</strong>.</p>
          <p>Please be ready to take the test at that time.</p>
          <p>Regards,<br/>Eduroutez Team</p>`;

        // Use global fetch (Node >=18) to POST to internal email route
        await fetch(sendEmailUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: [updatedCounselor.email], subject: 'Counselor Test Scheduled', message })
        });
      } catch (emailErr) {
        console.error('Failed to send scheduled test email:', emailErr?.message || emailErr);
      }

      return updatedCounselor;
    } catch (error) {
      throw error;
    }
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
