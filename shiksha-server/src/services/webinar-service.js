import { WebinarRepository } from "../repository/index.js";

class WebinarService {
  constructor() {
    this.webinarRepository = new WebinarRepository();
  }

  async create(data) {
    try {
      const webinar = await this.webinarRepository.create(data);
      return webinar;
    } catch (error) {
      throw error;
    }
  }
  async get(id) {
    const webinar = await this.webinarRepository.get(id);
    return webinar;
  }

  //getwebinarById
  async getwebinarById(id) {
    try {
      const webinar = await this.webinarRepository.getwebinarById(id);
      return webinar;
    } catch (error) {
      throw error;
    }
  }

  async getAllWebinar() {
    try {
      const blogs = await this.webinarRepository.getAll();
      return blogs;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllByUser(userId) {
    try {
      console.log("userId", userId);

    const filterConditions = { deletedAt: null };

      filterConditions.webinarCreatedBy = userId;
        
      const webinars = await this.webinarRepository.getwebinarByCreatedBy(userId);
      console.log("webinars", webinars);
      if (webinars.length === 0) {
        return null;
      }
      return webinars;
    } catch (error) {
      throw new Error("Cannot fetch webinars for the user");
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
      // const populateFields = ["createdBy"];
      const webinars = await this.webinarRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      return webinars;
    } catch (error) {
      console.log(error);
      throw new AppError("Cannot fetch data of all the webinars", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async update(id, data) {
    try {
      const webinar = await this.webinarRepository.update(id, data);
      return webinar;
    } catch (error) {
      throw error;
    }
  }

  //getMonthlyWebinarCount
  async getMonthlyWebinarCount(user) {
    try {
      const webinars = await this.webinarRepository.getMonthlyWebinarCount(user._id);
      return webinars;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const webinar = await this.webinarRepository.destroy(id);
      return webinar;
    } catch (error) {
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        throw new AppError("The webinar you requested to delete is not present", error.statusCode);
      }
      throw new AppError("Cannot delete the webinar ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export default WebinarService;

/*
    this is my #first #tweet . I am really #excited
*/
