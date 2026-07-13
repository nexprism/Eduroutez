import { StatusCodes } from "http-status-codes";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import AssessmentService from "../services/assessment-service.js";

const assessmentService = new AssessmentService();

export async function createAssessment(req, res) {
    try {
        const response = await assessmentService.create(req.body);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully created the assessment";
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

export async function getAssessments(req, res) {
    try {
        const response = await assessmentService.getAll();
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched assessments";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

export async function getAssessment(req, res) {
    try {
        const response = await assessmentService.getById(req.params.id);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched the assessment";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

export async function deleteAssessment(req, res) {
    try {
        const response = await assessmentService.delete(req.params.id);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully deleted the assessment";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

export async function seedDefaultAssessment(req, res) {
    try {
        const response = await assessmentService.ensureDefaultAssessment();
        SuccessResponse.data = response;
        SuccessResponse.message = "Default assessment is ready";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

export async function submitAssessment(req, res) {
    try {
        const { assessmentId, answers } = req.body;
        const userId = req.user?._id || null;
        const response = await assessmentService.submit({
            assessmentId,
            userId,
            answers,
        });
        SuccessResponse.data = response;
        SuccessResponse.message =
            "Assessment submitted; college fit computed successfully";
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

export async function getAssessmentResult(req, res) {
    try {
        const response = await assessmentService.getResult(
            req.params.resultId
        );
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched the result";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

export async function getMyResults(req, res) {
    try {
        const userId = req.user?._id;
        if (!userId) {
            ErrorResponse.error = new Error("Authentication required");
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(ErrorResponse);
        }
        const response = await assessmentService.getResultsByUser(userId);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched your results";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}
