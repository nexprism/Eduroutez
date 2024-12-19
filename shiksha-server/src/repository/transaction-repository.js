import Transaction from "../models/Transaction.js";
import CrudRepository from "./crud-repository.js";

class TransactionRepository extends CrudRepository {
  constructor() {
    super(Transaction);
  }
}

export { TransactionRepository };
