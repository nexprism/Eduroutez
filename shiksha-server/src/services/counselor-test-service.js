import CounselorQuestionSetRepository from "../repository/counselor-question-set-repository.js";
import CounselorTestResultRepository from "../repository/counselor-test-result-repository.js";
import { CounselorRepository } from "../repository/index.js";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/errors/app-error.js";
import { sendEmail } from "../utils/Email/email.js";
import { ServerConfig } from "../config/index.js";



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

            // Send "Test Submitted - Under Review" email
            const counselor = await this.counselorRepository.getByid(counselorId);
            if (counselor && counselor.email) {
                const dashboardLink = `${ServerConfig.FRONTEND_HOST}/dashboard/counselor-verification`;
                const subject = "Test Submitted Successfully - Eduroutez";
                const message = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #2c3e50;">Test Submitted, ${counselor.firstname}!</h2>
                        <p>Thank you for completing the counselor verification test. Your results are now under review by our team.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Status:</strong> Verification In Progress</p>
                            <p><strong>Score:</strong> ${score} / ${questionSet.totalQuestions}</p>
                        </div>
                        
                        <p>You can track your verification status on your dashboard:</p>
                        <p><a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #fff; text-decoration: none; border-radius: 5px;">View Verification Status</a></p>
                        
                        <p>We will notify you once the admin has reviewed your application.</p>
                        <br>
                        <p>Best regards,<br><strong>Team Eduroutez</strong></p>
                    </div>
                `;
                try {
                    await sendEmail(counselor.email, subject, message);
                } catch (err) {
                    console.error("Failed to send submission email:", err.message);
                }
            }

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

            // Fetch test result to include in email
            const testResult = await this.testResultRepository.getByCounselor(counselorId);

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

            // Update test result verification status
            if (testResult) {
                await this.testResultRepository.update(testResult._id, { 
                    adminVerified: true, 
                    verifiedAt: new Date() 
                });
            }

            // Send email to counselor about the result and verification status
            if (updatedCounselor.email) {
                const subject = "Verification Successful - Eduroutez";
                const message = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #2c3e50;">Congratulations, ${updatedCounselor.firstname}!</h2>
                        <p>We are pleased to inform you that your counselor verification has been successfully approved by the Eduroutez team.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Test Result Summary:</h3>
                            <p><strong>Score:</strong> ${testResult ? testResult.score : 'N/A'}</p>
                            <p><strong>Total Questions:</strong> ${testResult ? testResult.totalQuestions : 'N/A'}</p>
                            <p><strong>Status:</strong> ${testResult ? (testResult.status === 'pass' ? 'Passed' : testResult.status) : 'N/A'}</p>
                        </div>

                        <p>You now have full access to your counselor dashboard. You can start managing your profile, setting up your availability, and interacting with students.</p>
                        
                        <p>You can access your verification details here: <a href="${ServerConfig.FRONTEND_HOST}/dashboard/counselor-verification" style="color: #3498db;">Verification Dashboard</a></p>

                        <p>Your official certification is available here: <a href="${certificateUrl}" style="color: #3498db;">Download Certificate</a></p>
                        
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        
                        <br>
                        <p>Best regards,<br><strong>Team Eduroutez</strong></p>
                    </div>
                `;
                try {
                    await sendEmail(updatedCounselor.email, subject, message);
                    console.log(`Verification email sent to ${updatedCounselor.email}`);
                } catch (emailError) {
                    console.error("Failed to send verification email:", emailError.message);
                }
            }

            return updatedCounselor;
        } catch (error) {
            throw error;
        }
    }

    // Admin: Reject Counselor
    async rejectCounselor(counselorId, reason) {
        try {
            const counselor = await this.counselorRepository.getByid(counselorId);
            if (!counselor) {
                throw new AppError("Counselor not found", StatusCodes.NOT_FOUND);
            }

            console.log("Rejecting counselor:", counselorId);
            const updatedCounselor = await this.counselorRepository.updateCounsellor(counselorId, {
                verificationStatus: "rejected",
                isVerified: false,
                verifiedBadge: false,
            });

            // Update test result verification status (marking it as reviewed/verified by admin even if rejected)
            const testResult = await this.testResultRepository.getByCounselor(counselorId);
            if (testResult) {
                await this.testResultRepository.update(testResult._id, { 
                    adminVerified: true, 
                    verifiedAt: new Date() 
                });
            }

            // Send email to counselor about rejection
            if (updatedCounselor.email) {
                const subject = "Verification Update - Eduroutez";
                const message = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #e74c3c;">Verification Status Update</h2>
                        <p>Hello ${updatedCounselor.firstname},</p>
                        <p>Thank you for your interest in becoming a counselor on Eduroutez. We have reviewed your application and test results.</p>
                        
                        <p>Unfortunately, your verification has not been approved at this time.</p>
                        
                        <p>You can check more details on your dashboard: <a href="${ServerConfig.FRONTEND_HOST}/dashboard/counselor-verification" style="color: #e74c3c;">Verification Dashboard</a></p>

                        ${reason ? `<div style="background-color: #fff5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #e74c3c;">
                            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
                        </div>` : ''}

                        <p>You may review our requirements and try applying again in the future.</p>
                        
                        <p>If you have any questions or believe this was a mistake, please contact our support team.</p>
                        
                        <br>
                        <p>Best regards,<br><strong>Team Eduroutez</strong></p>
                    </div>
                `;
                try {
                    await sendEmail(updatedCounselor.email, subject, message);
                    console.log(`Rejection email sent to ${updatedCounselor.email}`);
                } catch (emailError) {
                    console.error("Failed to send rejection email:", emailError.message);
                }
            }

            return updatedCounselor;
        } catch (error) {
            throw error;
        }
    }

    // Counselor: Get latest test result
    async getLatestTestResult(counselorId) {
        try {
            const result = await this.testResultRepository.model.findOne({
                counselorId: counselorId,
            }).sort({ createdAt: -1 });
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default CounselorTestService;
