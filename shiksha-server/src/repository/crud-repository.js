class CrudRepository {
  constructor(model) {
    this.model = model;
  }


  async create(data) {
    try {
      const result = await this.model.create(data);
      return result;
    } catch (error) {
      console.log(error.message)
      throw error;
    }
  }

  async destroy(id) {
    try {
      // console.log('iddcfvghju',id);
      const result = await this.model.findByIdAndUpdate({ _id: id }, { deletedAt: new Date(), deleted: true });
      return result;
      console.log('result', result);
    } catch (error) {
      throw error;
    }
  }


  async get(id, populateFields = []) {
    try {
      console.log('hello', id);

      let result = await this.model.findById(id);

      if (result.plan && result.reviews) {
        result = await this.model.findById(id).populate("plan").populate("reviews");
      }

      if (populateFields?.length > 0) {
        result = await this.model.findById(id).populate(populateFields);
      }

      console.log('result', result);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getALL() {
    try {
      const result = await this.model.find();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAll(filterCon = {}, sortCon = {}, pageNum, limitNum, populateFields = [], selectFields = {}) {
    try {
      console.log('Filter conditions:', filterCon);
      sortCon = Object.keys(sortCon).length === 0 ? { createdAt: -1 } : sortCon;
      console.log('Final Sort:', sortCon);
      console.log('Limit:', limitNum);

      // Cap limit to prevent memory and timeout issues
      const maxLimit = 500; // Increased to allow more items in dropdowns
      const safeLimit = Math.min(limitNum || 200, maxLimit);
      const safePage = Math.max(pageNum || 1, 1);

      // Build the query properly with timeout protection
      let query = this.model.find(filterCon)
        .sort(sortCon)
        .limit(safeLimit)
        .skip((safePage - 1) * safeLimit)
        .maxTimeMS(30000); // 30 second timeout

      if (selectFields && Object.keys(selectFields).length > 0) {
        query = query.select(selectFields);
      }

      if (populateFields?.length > 0) {
        // Populate each field individually with lean option for better performance
        populateFields.forEach(field => {
          query = query.populate({
            path: field,
            select: '-__v' // Exclude version field for better performance
          });
        });
      }

      const result = await query.lean().exec();

      // Get the total count of documents matching the filter (with timeout)
      const totalDocuments = await this.model.countDocuments(filterCon).maxTimeMS(10000).exec();

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

  async update(id, data) {
    try {
      const result = await this.model.findByIdAndUpdate(id, data, { new: true });
      console.log('result', result);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default CrudRepository;
