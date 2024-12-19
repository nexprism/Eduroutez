import Promotion from "../models/Promotion.js";
import CrudRepository from "./crud-repository.js";

class PromotionRepository extends CrudRepository {
  constructor() {
    super(Promotion);
  }
}

export { PromotionRepository };
