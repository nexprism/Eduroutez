import InstituteIssues from "../models/Instituteissues.js";
import User from "../models/User.js";
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
        const issues = await InstituteIssues.find().sort({ createdAt: -1 });

        //fetch istitute details from user
        if (issues.length > 0) {
          for (let i = 0; i < issues.length; i++) {
             if (typeof issues[i].toObject === 'function') {
                  issues[i] = issues[i].toObject();
                } else if (typeof issues[i].toJSON === 'function') {
                    issues[i] = issues[i].toJSON();
                } else {
                    issues[i] = JSON.parse(JSON.stringify(issues[i]));
                }
                
            if (issues[i].institute) {
                const user_id = issues[i].institute.toString();
                const user = await User.findOne({ _id: user_id }).select("email contact_number as institutePhone name as instituteName role");
                if (user) {
                issues[i].institute = user;
                }
            }
          }
        }

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
