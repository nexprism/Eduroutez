import CrudRepository from "./crud-repository.js";
import CounselorQuestionSet from "../models/CounselorQuestionSet.js";

class CounselorQuestionSetRepository extends CrudRepository {
    constructor() {
        super(CounselorQuestionSet);
    }

    async getRandomSet() {
        try {
            const count = await this.model.countDocuments();
            const random = Math.floor(Math.random() * count);
            const result = await this.model.findOne().skip(random);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default CounselorQuestionSetRepository;
