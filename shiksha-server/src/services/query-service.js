import { QueryRepository } from "../repository/query-repository.js";
import AppError from "../utils/errors/app-error.js";
import { QueryAllocationRepository } from "../repository/query-allocation-repository.js";
import { query } from "express";

class questionAnswerService {
  constructor() {
    this.queryRepository = new QueryRepository();
    this.queryAllocationRepository = new QueryAllocationRepository();
  }

  async create(data) {
    try {
      const questionAnswer = await this.queryRepository.create(data);
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
      const populateFields = ["instituteIds"];
      const questionAnswers = await this.queryRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);

      return questionAnswers;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the questionAnswers", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    const questionAnswer = await this.queryRepository.get(id);
    return questionAnswer;
  }

  //QueryAllocation
  async QueryAllocation(data) {
    
      const questionAnswer = await this.queryRepository.QueryAllocation(data);
      return questionAnswer;
    
  }

  //getByInstitute
  async getByInstitute(id,query) {

    console.log("req.params.id", id);
    console.log("req.query", query);
    const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    

    // Parse JSON strings from query parameters to objects
    const parsedFilters = JSON.parse(filters);
    const parsedSearchFields = JSON.parse(searchFields);
    const parsedSort = JSON.parse(sort);

    parsedFilters.institute = id;

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
    const populateFields = ["query"];
    const questionAnswer = await this.queryAllocationRepository.getAll(filterConditions, sortConditions, pageNum, limitNum, populateFields);
    return questionAnswer
  }

  async update(id, data) {
    try {
      const questionAnswer = await this.queryAllocationRepository.updateQuery(id, data);

      return questionAnswer;
    } catch (error) {
      throw new AppError("Cannot update the questionAnswer ", error.message);
    }
  }

  async delete(id) {
    try {
      const questionAnswer = await this.queryRepository.destroy(id);
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
