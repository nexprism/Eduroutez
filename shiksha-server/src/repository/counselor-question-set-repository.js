import CrudRepository from "./crud-repository.js";
import CounselorQuestionSet from "../models/CounselorQuestionSet.js";

class CounselorQuestionSetRepository extends CrudRepository {
    constructor() {
        super(CounselorQuestionSet);
    }

    async getRandomSet(stream) {
        try {
            const filter = stream ? { stream } : {};
            const count = await this.model.countDocuments(filter);
            if (count === 0) return null;
            const random = Math.floor(Math.random() * count);
            const result = await this.model.findOne(filter).skip(random);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default CounselorQuestionSetRepository;
