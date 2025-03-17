import { QuestionAnswerRepository } from "../repository/question-answer-repository.js";
import { UserRepository } from "../repository/user-repository.js";

class questionAnswerService {
  constructor() {
    this.questionAnswerRepository = new QuestionAnswerRepository();
    this.userRepository = new UserRepository();
  }

  async create(data) {
    try {
      const questionAnswer = await this.questionAnswerRepository.create(data);
      return questionAnswer;
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
         if (Array.isArray(value)) {
              const regexPattern = value.join('|'); // Convert array to regex pattern
              filterConditions.$and = filterConditions.$and || [];
              filterConditions.$and.push({ [key]: { $regex: regexPattern, $options: 'i' } });
            }else{
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
      const questionAnswers = await this.questionAnswerRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return questionAnswers;
    } catch (error) {
      console.log('error on course', error.message);
      throw new AppError("Cannot fetch data of all the questionAnswers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const questionAnswer = await this.questionAnswerRepository.getQuestion(id);
    return questionAnswer;
  }

  async getbyEmail(email) {
    try{
    const questionAnswer = await this.questionAnswerRepository.getbyInstituteEmail(email);
    return questionAnswer;
    }
    catch (error) {
      console.log(error.message);

      throw error;
    }
  }

  async update(id, data) {
    try {
      const questionAnswer = await this.questionAnswerRepository.submitAnswer(id, data);

      const existingUser = await this.userRepository.get(data.answeredBy);

      // Check if email doesn't exists
      if (!existingUser) {
        return res.status(404).json({ status: "failed", message: "Email doesn't exists" });
      }

      //increment points of user
      const userPayload = { points: existingUser.points + 50 };
      console.log('userPayload',userPayload);
      let level;
      let commission;

      if (userPayload.points <= 500) {
        level = "Career Advisor";
        commission = "30";
      } else if (userPayload.points <= 2000) {
        level = "Senior Career Advisor";
        commission = "35";
      } else if (userPayload.points <= 5000) {
        level = "Career Consultant";
        commission = "40";
      } else if (userPayload.points <= 10000) {
        level = "Career Consultant Specialist";
        commission = "45";
      } else if (userPayload.points <= 50000) {
        level = "Lead Career Consultant";
        commission = "50";
      }

      userPayload.level = level;
      userPayload.commission = commission;
      const userResponse = await this.userRepository.update(existingUser.id, userPayload);

      
      // console.log('userResponse',userResponse);

      return questionAnswer;
    } catch (error) {
      throw new AppError("Cannot update the questionAnswer ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id) {
    try {
      const questionAnswer = await this.questionAnswerRepository.destroy(id);
      return questionAnswer;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The questionAnswer you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the questionAnswer ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default questionAnswerService;
