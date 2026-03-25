import CounselorQuestionSetRepository from "../repository/counselor-question-set-repository.js";
import CounselorTestResultRepository from "../repository/counselor-test-result-repository.js";
import { CounselorRepository } from "../repository/index.js";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/errors/app-error.js";

class CounselorTestService {
    constructor() {
        this.questionSetRepository = new CounselorQuestionSetRepository();
        this.testResultRepository = new CounselorTestResultRepository();
        this.counselorRepository = new CounselorRepository();
    }

    // Counselor: Start process / Record Payment
    async recordPayment(counselorId, paymentDetails) {
        try {
            // Create a Transaction with status COMPLETED
            const { amount, subscription, paymentId, remarks } = paymentDetails;
            const Transaction = (await import("../models/Transaction.js")).default;
            const transaction = await Transaction.create({
                user: counselorId,
                subscription: subscription || null,
                amount: amount || 0,
                transactionDate: new Date(),
                remarks: remarks || "Counselor test payment",
                paymentId: paymentId || (Math.random().toString(36).substring(2, 15)),
                status: "COMPLETED",
            });

            // Update counselor status
            const updatedCounselor = await this.counselorRepository.updateCounsellor(counselorId, {
                verificationStatus: "test_pending",
            });
            return { ...updatedCounselor.toObject(), transactionId: transaction._id };
        } catch (error) {
            throw error;
        }
    }

    // Admin: Create/Manage Question Sets
    async createQuestionSet(data) {
        try {
            const result = await this.questionSetRepository.create(data);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getAllQuestionSets(query) {
        try {
            const result = await this.questionSetRepository.getAll(query);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Counselor: Get random test set
    async getRandomTestSet() {
        try {
            const result = await this.questionSetRepository.getRandomSet();
            if (!result) {
                throw new AppError("No test sets found in the system", StatusCodes.NOT_FOUND);
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Counselor: Submit Test
    async submitTest(counselorId, data) {
        try {
            const { questionSetId, answers, timeTaken, isTimedOut } = data;
            const questionSet = await this.questionSetRepository.get(questionSetId);
            if (!questionSet) {
                throw new AppError("Question set not found", StatusCodes.NOT_FOUND);
            }

            // Find the latest COMPLETED transaction for this counselor
            const Transaction = (await import("../models/Transaction.js")).default;
            const latestTransaction = await Transaction.findOne({
                user: counselorId,
                status: "COMPLETED"
            }).sort({ transactionDate: -1 });

            let paymentId = latestTransaction ? latestTransaction.paymentId : undefined;

            let score = 0;
            const processedAnswers = answers.map((ans) => {
                const question = questionSet.questions.id(ans.questionId);
                const correctOption = question.options.find((opt) => opt.isCorrect);
                const isCorrect = correctOption && correctOption._id.toString() === ans.selectedOptionId;
                if (isCorrect) score++;
                return {
                    questionId: ans.questionId,
                    selectedOptionId: ans.selectedOptionId,
                    isCorrect,
                };
            });

            const resultStatus = isTimedOut ? "timed_out" : (score >= questionSet.totalQuestions * 0.5 ? "pass" : "fail");

            const testResult = await this.testResultRepository.create({
                counselorId,
                questionSetId,
                answers: processedAnswers,
                score,
                totalQuestions: questionSet.totalQuestions,
                timeTaken,
                status: resultStatus,
                paymentId // Save paymentId in test result
            });

            // Update Counselor status
            const counselorUpdateData = {
                verificationStatus: "verification_in_progress",
                testResult: testResult._id,
            };

            await this.counselorRepository.updateCounsellor(counselorId, counselorUpdateData);

            return testResult;
        } catch (error) {
            throw error;
        }
    }

    // Admin: Get all test results for verification
    async getPendingVerifications() {
        try {
            const counselors = await this.counselorRepository.model.find({
                verificationStatus: "verification_in_progress",
            }).populate({
                path: "testResult",
                populate: { path: "questionSetId" }
            });
            return counselors;
        } catch (error) {
            throw error;
        }
    }

    // Admin: Verify Counselor
    async verifyCounselor(counselorId) {
        try {
            const counselor = await this.counselorRepository.getByid(counselorId);
            if (!counselor) {
                throw new AppError("Counselor not found", StatusCodes.NOT_FOUND);
            }

            // Automatically generate certificate (using placeholder for now)
            const certificateUrl = `https://eduroutez.com/certificates/counselor_${counselorId}.pdf`;

            console.log("Verifying counselor:", counselorId);
            const updatedCounselor = await this.counselorRepository.updateCounsellor(counselorId, {
                verificationStatus: "verified",
                isVerified: true,
                verifiedBadge: true,
                certificateUrl,
                setRoleCounsellor: true,
            });
            return updatedCounselor;
        } catch (error) {
            throw error;
        }
    }
}

export default CounselorTestService;
