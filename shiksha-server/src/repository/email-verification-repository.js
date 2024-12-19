import EmailVerification from "../models/EmailVerification.js";
import CrudRepository from "./crud-repository.js";

class EmailVerificationRepository extends CrudRepository {
  constructor() {
    super(EmailVerification);
  }

  async findBy(data) {
    try {
      const response = await EmailVerification.findOne(data);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export { EmailVerificationRepository };
