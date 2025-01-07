import InstituteIssues from "../models/Instituteissues.js";
import CrudRepository from "./crud-repository.js";

class InstituteIssuesRepository extends CrudRepository {
  constructor() {
      super(InstituteIssues);
  }
}

export { InstituteIssuesRepository };
