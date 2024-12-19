import Counselor from "../models/Counselor.js";
import CrudRepository from "./crud-repository.js";

class CounselorRepository extends CrudRepository {
  constructor() {
    super(Counselor);
  }
}

export { CounselorRepository };
