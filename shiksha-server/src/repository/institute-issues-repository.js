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

    async getHelpList() {
      try {
        const issues = await InstituteIssues.find()
          .populate({
            path: "institute",
            select: "instituteName email institutePhone"
          });
        return issues;
      } catch (error) {
        throw error;
      }
    }

    //getIssueById
    async getIssueById(id) {
      try {
        const issue = await InstituteIssues.findById(id).populate({
          path: "institute",
          select: "instituteName email institutePhone"
        });
        return issue;
      } catch (error) {
        throw error;
      }
    }
}
export { InstituteIssuesRepository };
