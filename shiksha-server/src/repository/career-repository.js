import Career from "../models/Career.js";
import CrudRepository from "./crud-repository.js";

class CareerRepository extends CrudRepository {
  constructor() {
    super(Career);
  }
}

export { CareerRepository };
