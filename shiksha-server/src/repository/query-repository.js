import Query from "../models/Query.js";
import CrudRepository from "./crud-repository.js";

class QueryRepository extends CrudRepository {
  constructor() {
    super(Query);
  }

  async getQueryByInstitute(instituteId) {
    try {
      const query = await Query.find({ instituteId : instituteId }).populate("instituteId");
      return query;

    } catch (error) {
      throw error;
    }

  }

        
}

export { QueryRepository };
