import { NewsRepository } from "../repository/index.js";



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
      return await News.find(query);
    } catch (error) {
      throw new Error("Error fetching news articles: " + error.message);
    }
  }

  async get(id) {
    try {
      return await News.findById(id);
    } catch (error) {
      throw new Error("Error fetching news article: " + error.message);
    }
  }

    //getNewsByInstitute
    async getNewsByInstitute(id) {
        try {
            return await News.findByInstitute(id);
        }
        catch (error) {
            throw new Error("Error fetching news article: " + error.message);
        }
    }

  async update(id, payload) {
    try {
      return await News.findByIdAndUpdate(id, payload, { new: true });
    } catch (error) {
      throw new Error("Error updating news article: " + error.message);
    }
  }

  async delete(id) {
    try {
      return await News.findByIdAndDelete(id);
    } catch (error) {
      throw new Error("Error deleting news article: " + error.message);
    }
  }
}

export default NewsService;
