import Payout from "../models/Payout.js";
import CrudRepository from "./crud-repository.js";

class PayoutRepository extends CrudRepository {
  constructor() {
    super(Payout);
  }
}

export { PayoutRepository };
