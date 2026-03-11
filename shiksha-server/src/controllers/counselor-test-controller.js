import { StatusCodes } from "http-status-codes";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import CounselorTestService from "../services/counselor-test-service.js";

const counselorTestService = new CounselorTestService();

// Counselor: Record Payment and allow test
export const recordPayment = async (req, res) => {
    try {
        const counselorId = req.user._id;
        const response = await counselorTestService.recordPayment(counselorId, req.body);
        SuccessResponse.data = response;
        SuccessResponse.message = "Payment recorded, you can now take the test";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};

// Superadmin: Create Question Set
export const createQuestionSet = async (req, res) => {
    try {
        const response = await counselorTestService.createQuestionSet(req.body);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully created question set";
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};

// Superadmin: Get All Question Sets
export const getAllQuestionSets = async (req, res) => {
    try {
        const response = await counselorTestService.getAllQuestionSets(req.query);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched question sets";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};

// Counselor: Get Random Question Set for Test
export const getRandomTestSet = async (req, res) => {
    try {
        const response = await counselorTestService.getRandomTestSet();
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched random test set";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};

// Counselor: Submit Test Result
export const submitTestResult = async (req, res) => {
    try {
        const counselorId = req.user._id; // set by authenticate-middleware
        const response = await counselorTestService.submitTest(counselorId, req.body);
        SuccessResponse.data = response;
        SuccessResponse.message = "Test submitted successfully";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};

// Superadmin: Get Pending Counselor Verifications
export const getPendingVerifications = async (req, res) => {
    try {
        const response = await counselorTestService.getPendingVerifications();
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched pending verifications";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};

// Superadmin: Verify/Approve Counselor
export const verifyCounselor = async (req, res) => {
    try {
        const response = await counselorTestService.verifyCounselor(req.params.id);
        SuccessResponse.data = response;
        SuccessResponse.message = "Counselor verified successfully";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};
