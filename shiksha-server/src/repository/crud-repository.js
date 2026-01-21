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
    console.log('dfgh', filterCon)
    sortCon = Object.keys(sortCon).length === 0 ? { createdAt: -1 } : sortCon;
    console.log('Final Sort:', sortCon);
    console.log('Limit:', limitNum);
    // Using find() with explicit options for allowDiskUse
    let query = this.model.find(filterCon, null, { allowDiskUse: true }).sort(sortCon);

    if (pageNum > 0 && limitNum) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    if (selectFields && Object.keys(selectFields).length > 0) {
      query = query.select(selectFields);
    }

    if (populateFields?.length > 0) {
      query = query.populate(populateFields);
    }

    // Enable allowDiskUse to handle large sorts that exceed 32MB RAM
    query = query.allowDiskUse(true);

    const result = await query.lean();

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
      console.log('result', result);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default CrudRepository;
