import CrudRepository from "./crud-repository.js";
import CounselorTestResult from "../models/CounselorTestResult.js";

class CounselorTestResultRepository extends CrudRepository {
    constructor() {
        super(CounselorTestResult);
    }

    async getByCounselor(counselorId) {
        try {
            const result = await this.model.findOne({ counselorId }).populate("questionSetId");
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default CounselorTestResultRepository;
