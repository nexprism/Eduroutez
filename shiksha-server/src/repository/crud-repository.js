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
      
      // Build the query properly
      let query = this.model.find(filterCon).sort(sortCon);

      if (pageNum > 0 && limitNum && limitNum < 10000) { // Cap limit to prevent memory issues
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
      } else if (limitNum >= 10000) {
        // If limit is too large, cap it to prevent memory issues
        console.warn(`Limit ${limitNum} is too large, capping to 10000`);
        query = query.skip((pageNum - 1) * 10000).limit(10000);
      }

      if (selectFields && Object.keys(selectFields).length > 0) {
        query = query.select(selectFields);
      }

      if (populateFields?.length > 0) {
        // Populate each field individually
        populateFields.forEach(field => {
          query = query.populate(field);
        });
      }

      const result = await query.lean().exec();

      // Get the total count of documents matching the filter
      const totalDocuments = await this.model.countDocuments(filterCon);

      return {
        result,
        currentPage: pageNum,
        totalPages: Math.ceil(totalDocuments / (limitNum < 10000 ? limitNum : 10000)),
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
