import { BannerRepository } from "../repository/index.js";

class BannerService {
  constructor() {
    this.bannerRepository = new BannerRepository();
  }

  async create(data) {
    try {
      const banner = await this.bannerRepository.create(data);
      return banner;
    } catch (error) {
      throw error;
    }
  }

  async getAll(query) {
    try {
      const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      const filterConditions = { deletedAt: null };

      for (const [key, value] of Object.entries(parsedFilters)) {
        filterConditions[key] = value;
      }

      const searchConditions = [];
      for (const [field, term] of Object.entries(parsedSearchFields)) {
        searchConditions.push({ [field]: { $regex: term, $options: "i" } });
      }
      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }

      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }

      const banners = await this.bannerRepository.getAll(
        filterConditions,
        sortConditions,
        pageNum,
        limitNum
      );
      return banners;
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    const banner = await this.bannerRepository.get(id);
    return banner;
  }

  async update(id, data) {
    try {
      const banner = await this.bannerRepository.update(id, data);
      return banner;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const banner = await this.bannerRepository.destroy(id);
      return banner;
    } catch (error) {
      throw error;
    }
  }
}

export default BannerService;
