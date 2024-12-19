import InstituteInquiry from "../models/InstituteInquiry.js";
import CrudRepository from "./crud-repository.js";

class InstituteInquiryRepository extends CrudRepository {
  constructor() {
    super(InstituteInquiry);
  }
}

export { InstituteInquiryRepository };
