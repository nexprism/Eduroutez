import { StatusCodes } from "http-status-codes";
import RecruiterService from "../services/recruiter-service.js";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const recruiterService = new RecruiterService();
const SingleUploader  = FileUpload.upload.single("image");


/**
 * POST : /recruiters
 * req.body {name, email, ...}
 */
export async function createRecruiter(req, res) {
    try {
        SingleUploader(req, res, async function (err) {
            if (err) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
            }

            const payload = { ...req.body };

            const institute = req.user._id;

            console.log('file',req.file);

            if (req.file) {
                payload.image = req.file.filename;
            }

            payload.institute = institute;

            const response = await recruiterService.create(payload);

            SuccessResponse.data = response;

            SuccessResponse.message = "Successfully created a recruiter";

        return res.status(StatusCodes.CREATED).json(SuccessResponse);
        });
    } catch (error) {
        console.log('Error creating recruiter:', error.message);
        ErrorResponse.error = error;

        return res.status(error.statusCode).json(ErrorResponse);
    }
}

//getRecruitersByInstitute
/**
 * GET : /recruiters
 * req.query {}
 */
export async function getRecruitersByInstitute(req, res) {
    try {
        const institute = req.params.id;
        const query = req.query;

        // Add instituteId to the filters in the query
        if (!query.filters) {
            query.filters = JSON.stringify({ institute });
        } else {
            const filters = JSON.parse(query.filters);
            filters.institute = instituteId;
            query.filters = JSON.stringify(filters);
        }
        console.log("Query:", query);

        const response = await recruiterService.getAll(query);
        // const response = await recruiterService.getRecruitersByInstitute(instituteId);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched recruiters";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.error("Error in getRecruitersByInstitute:", error.message);
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

/**
 * GET : /recruiters
 * req.query {}
 */
export async function getRecruiters(req, res) {
    try {
        const response = await recruiterService.getAll(req.query);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched recruiters";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

/**
 * GET : /recruiters/:id
 * req.params {id}
 */
export async function getRecruiter(req, res) {
    try {
        const response = await recruiterService.get(req.params.id);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched the recruiter";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

/**
 * PATCH : /recruiters/:id
 * req.body {name, email, ...}
 */
export async function updateRecruiter(req, res) {
    try {
        const recruiterId = req.params.id;
        const payload = { ...req.body };

        const response = await recruiterService.update(recruiterId, payload);

        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully updated the recruiter";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.error("Update recruiter error:", error);
        ErrorResponse.error = error;
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

/**
 * DELETE : /recruiters/:id
 * req.params {id}
 */
export async function deleteRecruiter(req, res) {
    try {
        const response = await recruiterService.delete(req.params.id);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully deleted the recruiter";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.error("Delete recruiter error:", error.message);
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}
