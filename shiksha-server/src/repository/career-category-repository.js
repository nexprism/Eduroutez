import CareerCategory from "../models/CareerCategory.js";
import CrudRepository from "./crud-repository.js";

class CareerCategoryRepository extends CrudRepository {
  constructor() {
    super(CareerCategory);
  }
}

export { CareerCategoryRepository };
