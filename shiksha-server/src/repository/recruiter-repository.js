import CrudRepository from "./crud-repository.js";
import Recruiter from "../models/Recruiter.js";

class RecruiterRepository extends CrudRepository {
    constructor() {
        super(Recruiter);
    }


    //getRecruitersByInstitute
    async getRecruitersByInstitute(instituteId) {
        try {
            const recruiters = await this.model.find({ institute : instituteId });
            return recruiters;
        }
        catch (error) {
            throw error;
        }
    }
    

    // Add any custom methods for the RecruiterRepository here
}

export { RecruiterRepository };
