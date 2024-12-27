import Query from "../models/Query.js";
import CrudRepository from "./crud-repository.js";

class QueryRepository extends CrudRepository {
  constructor() {
    super(Query);
  }
}

export { QueryRepository };
