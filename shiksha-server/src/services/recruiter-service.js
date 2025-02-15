import { RecruiterRepository } from "../repository/index.js";
class RecruiterService {
    constructor() {
        this.recruiterRepository = new RecruiterRepository();
    }

    async create(data) {
        try {
            const recruiter = await this.recruiterRepository.create(data);
            return recruiter;
        } catch (error) {
            throw error;
        }
    }

    //getRecruitersByInstitute
    async getRecruitersByInstitute(instituteId) {
        try {
            const recruiters = await this.recruiterRepository.getRecruitersByInstitute(instituteId);
            return recruiters;
        } catch (error) {
            throw error;
        }
    }

    async getAll(query) {
        try {
            const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            // Parse JSON strings from query parameters to objects
            const parsedFilters = JSON.parse(filters);
            const parsedSearchFields = JSON.parse(searchFields);
            const parsedSort = JSON.parse(sort);

            // Build filter conditions for multiple fields
          const filterConditions = { deletedAt: null };

            for (const [key, value] of Object.entries(parsedFilters)) {
                filterConditions[key] = value;
            }

            // Build search conditions for multiple fields with partial matching
            const searchConditions = [];
            for (const [field, term] of Object.entries(parsedSearchFields)) {
                searchConditions.push({ [field]: { $regex: term, $options: "i" } });
            }
            if (searchConditions.length > 0) {
                filterConditions.$or = searchConditions;
            }

            // Build sort conditions
            const sortConditions = {};
            for (const [field, direction] of Object.entries(parsedSort)) {
                sortConditions[field] = direction === "asc" ? 1 : -1;
            }

            // Execute query with dynamic filters, sorting, and pagination
            const recruiters = await this.recruiterRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

            return recruiters;
        } catch (error) {
            throw new AppError("Cannot fetch data of all the recruiters", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async get(id) {
        const recruiter = await this.recruiterRepository.get(id);
        return recruiter;
    }

    async update(id, data) {
        try {
            const recruiter = await this.recruiterRepository.update(id, data);

            return recruiter;
        } catch (error) {
            throw new AppError("Cannot update the recruiter", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id) {
        try {
            const recruiter = await this.recruiterRepository.destroy(id);
            return recruiter;
        } catch (error) {
            if (error.statusCode === StatusCodes.NOT_FOUND) {
                throw new AppError("The recruiter you requested to delete is not present", error.statusCode);
            }
            throw new AppError("Cannot delete the recruiter", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export default RecruiterService;
