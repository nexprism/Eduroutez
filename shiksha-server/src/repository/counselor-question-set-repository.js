import CrudRepository from "./crud-repository.js";
import CounselorQuestionSet from "../models/CounselorQuestionSet.js";

class CounselorQuestionSetRepository extends CrudRepository {
    constructor() {
        super(CounselorQuestionSet);
    }

    async getRandomSet(stream) {
        try {
            const filter = stream
                ? { $or: [{ stream }, { streams: { $in: Array.isArray(stream) ? stream : [stream] } }] }
                : {};
            const count = await this.model.countDocuments(filter);
            if (count === 0) return null;
            const random = Math.floor(Math.random() * count);
            const result = await this.model.findOne(filter).skip(random);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getRandomSetByStreams(streams) {
        try {
            if (!streams || streams.length === 0) {
                return this.getRandomSet(null);
            }
            const filter = {
                $or: [
                    { stream: { $in: streams } },
                    { streams: { $in: streams } },
                ]
            };
            const count = await this.model.countDocuments(filter);
            if (count === 0) {
                return this.getRandomSet(null);
            }
            const random = Math.floor(Math.random() * count);
            const result = await this.model.findOne(filter).skip(random);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default CounselorQuestionSetRepository;
