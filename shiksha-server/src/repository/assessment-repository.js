import Assessment from "../models/Assessment.js";
import AssessmentResult from "../models/AssessmentResult.js";
import CrudRepository from "./crud-repository.js";

class AssessmentRepository extends CrudRepository {
    constructor() {
        super(Assessment);
    }

    async getActive(filterCon = {}) {
        try {
            return await this.model
                .find({ ...filterCon, isActive: true, deletedAt: null })
                .lean();
        } catch (error) {
            throw error;
        }
    }
}

export { AssessmentRepository };

class AssessmentResultRepository extends CrudRepository {
    constructor() {
        super(AssessmentResult);
    }

    async getByUser(userId) {
        try {
            return await this.model
                .find({ userId, deletedAt: null })
                .sort({ createdAt: -1 })
                .lean();
        } catch (error) {
            throw error;
        }
    }
}

export { AssessmentResultRepository };
