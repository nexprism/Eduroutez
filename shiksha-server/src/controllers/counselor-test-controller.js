// Counselor: Check if eligible to give test (within 30 days of payment, not already taken)
import { TransactionRepository } from "../repository/transaction-repository.js";
import CounselorTestResultRepository from "../repository/counselor-test-result-repository.js";
import { CounselorRepository } from "../repository/counselor-repository.js";

const transactionRepository = new TransactionRepository();
const testResultRepository = new CounselorTestResultRepository();
const counselorRepository = new CounselorRepository();

export const canCounselorGiveTest = async (req, res) => {
    try {
        const counselorId = req.user._id;
        // Find the counselor
        const counselor = await counselorRepository.getByid(counselorId);
        if (!counselor) {
            SuccessResponse.data = { eligible: false, reason: "need to pay" };
            SuccessResponse.message = "Counselor needs to pay.";
            return res.status(StatusCodes.OK).json(SuccessResponse);
        }

        // Find the latest COMPLETED transaction for this counselor (user)
        const transaction = await transactionRepository.model.findOne({
            user: counselorId,
            status: "COMPLETED"
        }).sort({ transactionDate: -1 });

        if (!transaction) {
            SuccessResponse.data = { eligible: false, reason: "No completed payment found" };
            SuccessResponse.message = "Counselor has not paid yet.";
            return res.status(StatusCodes.OK).json(SuccessResponse);
        }

        // Check if the payment is within 30 days
        const now = new Date();
        const paymentDate = new Date(transaction.transactionDate);
        const diffDays = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
            SuccessResponse.data = { eligible: false, reason: "Payment expired", paymentDate };
            SuccessResponse.message = "Payment is older than 30 days.";
            return res.status(StatusCodes.OK).json(SuccessResponse);
        }


        // Always require a new payment for each test attempt, regardless of result status
        const testResult = await testResultRepository.model.findOne({
            counselorId: counselorId,
            paymentId: transaction.paymentId
        });

        if (testResult) {
            SuccessResponse.data = {
                eligible: false,
                reason: `Test already taken for this payment on ${new Date(testResult.createdAt).toLocaleString()}. Please pay again to retake.`,
                testResultId: testResult._id,
                takenAt: testResult.createdAt
            };
            SuccessResponse.message = "Counselor has already taken the test for this payment.";
            return res.status(StatusCodes.OK).json(SuccessResponse);
        }

        SuccessResponse.data = { eligible: true, paymentDate };
        SuccessResponse.message = "Counselor is eligible to take the test.";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};
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

// Counselor: Get Result
export const getLatestTestResult = async (req, res) => {
    try {
        const counselorId = req.user._id;
        const response = await counselorTestService.getLatestTestResult(counselorId);
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully fetched latest test result";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode || 500).json(ErrorResponse);
    }
};
