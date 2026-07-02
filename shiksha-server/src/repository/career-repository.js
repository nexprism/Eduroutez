import Career from "../models/Career.js";
import CrudRepository from "./crud-repository.js";

class CareerRepository extends CrudRepository {
  constructor() {
    super(Career);
  }

  //getByField
    async getByField(value, field) {
      try {
        const career = await Career.findOne({ [field]: value });
        return career;
      } catch (error) {
        console.error('Error in CareerRepository.getByField:', error.message);
        throw error;
      }
    }

  async getCareer(instituteId) {
    try {
      console.log('id', instituteId);
      const careers = await Career.find({ instituteId: instituteId });
      console.log(careers);
      return careers;
    } catch (error) {
      console.error('Error in careerRepository.getAllByInstitute:', error.message);
      throw error;
    }
  }

  //getAll with filtering by isPublished/isActive
  async getAll(filterCon = {}, sortCon = {}, pageNum, limitNum, populateFields = [], selectFields = {}) {
    try {
      console.log('Filter conditions:', filterCon);
      sortCon = Object.keys(sortCon).length === 0 ? { createdAt: -1 } : sortCon;
      console.log('Final Sort:', sortCon);
      console.log('Limit:', limitNum);

      // Cap limit to prevent memory and timeout issues
      const maxLimit = 500;
      const safeLimit = Math.min(limitNum || 200, maxLimit);
      const safePage = Math.max(pageNum || 1, 1);

      // Build the query properly with timeout protection
      let query = Career.find(filterCon)
        .where('deletedAt').equals(null)
        .sort(sortCon)
        .limit(safeLimit)
        .skip((safePage - 1) * safeLimit)
        .maxTimeMS(30000);

      if (selectFields && Object.keys(selectFields).length > 0) {
        query = query.select(selectFields);
      }

      if (populateFields?.length > 0) {
        populateFields.forEach(field => {
          query = query.populate({
            path: field,
            select: '-__v'
          });
        });
      }

      const result = await query.lean().exec();

      // Get the total count of documents matching the filter (with timeout)
      const totalDocuments = await Career.countDocuments(filterCon).maxTimeMS(10000).exec();

      return {
        result,
        currentPage: safePage,
        totalPages: Math.ceil(totalDocuments / safeLimit),
        totalDocuments,
      };
    } catch (error) {
      console.error('Error in getAll:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

}

export { CareerRepository };