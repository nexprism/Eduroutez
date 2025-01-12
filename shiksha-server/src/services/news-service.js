import { NewsRepository } from "../repository/index.js";


import News from "../models/news.js";

class NewsService {
    constructor() {
        this.newsRepository = new NewsRepository();
    }
    
  async create(payload) {
    try {
        const blog = await this.newsRepository.create(payload);
    return blog;
    } catch (error) {
      throw new Error("Error creating news article: " + error.message);
    }
  }

    async getAll(query) {
        try {
            const { page = 1, limit = 100000, filters = "{}", searchFields = "{}", sort = "{}" } = query;
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
            // const populateFields = ["createdBy"];
            const blogs = await this.newsRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

            return blogs;
        } catch (error) {
            console.log(error);
            throw new AppError("Cannot fetch data of all the news", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

  async get(id) {
    try {
      console.log("Fetching news article with id: ", id);
      const data= await News.findById(id);
      console.log("data",data);
      return data;
    } catch (error) {
      throw new Error("Error fetching news article: " + error.message);
    }
  }

  //getAllNews
  async getAllNews() {
    try {
      const news = await this.newsRepository.getAllNews();
      return news;
    } catch (error) {
      throw new Error("Error fetching news article: " + error.message);
    }
  }
    

    //getNewsByInstitute
    async getNewsByInstitute(id) {
        try {
          console.log("instituteId", id);
            const news = await this.newsRepository.getNewsByInstitute(id);
            return news;
        }
        catch (error) {
            throw new Error("Error fetching news article: " + error.message);
        }
    }

  async update(id, payload) {
    try {
      console.log("Updating news article with id: ", id);
      console.log("Payload: ", payload);
        return await News.findByIdAndUpdate(id, payload, { new: true });
    } catch (error) {
      throw new Error("Error updating news article: " + error.message);
    }
  }

  async delete(id) {
    try {
      console.log("Deleting news article with id: ", id);
      const news = await this.newsRepository.delete(id);
    } catch (error) {
      throw new Error("Error deleting news article: " + error.message);
    }
  }
}

export default NewsService;
