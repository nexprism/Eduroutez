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
      const result = await this.model.findByIdAndDelete(id);
      return result;
      console.log('result',result);
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    try {
      // console.log('hello',id);
      
      var result = await this.model.findById(id);
      // console.log('result',result);
      if (result.plan) {
        var result = await this.model.findById(result._id).populate("plan");

      }

      if (result.reviews) {
        var result = await this.model.findById(result._id).populate("reviews");

      }

      
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

  async getAll(filterCon = {}, sortCon = {}, pageNum, limitNum, populateFields = []) {
    let query = this.model
      .find(filterCon)
      .sort(sortCon)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Populate fields if any
    if (populateFields?.length > 0) {
      populateFields?.forEach((field) => {
        query = query.populate(field);
      });
    }
    const result = await query;
    // Get the total count of documents matching the filter
    const totalDocuments = await this.model.countDocuments(filterCon);

    return {
      result,
      currentPage: pageNum,
      totalPages: Math.ceil(totalDocuments / limitNum),
      totalDocuments,
    };
  }

  async update(id, data) {
    try {
      const result = await this.model.findByIdAndUpdate(id, data, { new: true });
      console.log('result',result);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default CrudRepository;
