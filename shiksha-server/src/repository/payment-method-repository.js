import PaymentMethod from "../models/PaymentMethod.js";
import CrudRepository from "./crud-repository.js";

class PaymentMethodRepository extends CrudRepository {
  constructor() {
    super(PaymentMethod);
  }
}

export { PaymentMethodRepository };
