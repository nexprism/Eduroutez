import { query } from "express";
import Institute from "../models/Institute.js";
import Query from "../models/Query.js";
import QueryAllocation from "../models/QueryAllocation.js";
import CrudRepository from "./crud-repository.js";

class QueryAllocationRepository extends CrudRepository {
  constructor() {
      super(QueryAllocation);
  }
  //updatequery
    async updateQuery(queryId, data) {
        try {
            const result = await this.model.findOneAndUpdate({
                query: queryId
            },
                data,
                {
                    new: true,
                    runValidators: true
                }
            );
       
            return result;
        } catch (error) {
            throw error;
        }
    }


        
}

export { QueryAllocationRepository };
