import Email from "../models/Email.js";
import CrudRepository from "./crud-repository.js";

class EmailRepository extends CrudRepository {
  constructor() {
    super(Email);
  }
}

export { EmailRepository };
