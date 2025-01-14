import InstituteIssues from "../models/Instituteissues.js";
import CrudRepository from "./crud-repository.js";

class InstituteIssuesRepository extends CrudRepository {
  constructor() {
      super(InstituteIssues);
  }
  async createIssue(data) {
    try {
      const issue = new InstituteIssues(data);
      const result = await issue.save();
      return result;
    } catch (error) {
      console.log(error.message)
      throw error;
    }
  }
}
export { InstituteIssuesRepository };
