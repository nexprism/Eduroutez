import Institute from "../models/Institute.js";
import Query from "../models/Query.js";
import QueryAllocation from "../models/QueryAllocation.js";
import CrudRepository from "./crud-repository.js";

class QueryAllocationRepository extends CrudRepository {
  constructor() {
      super(QueryAllocation);
  }

        
}

export { QueryAllocationRepository };
