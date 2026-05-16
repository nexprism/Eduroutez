import { StatusCodes } from "http-status-codes";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import Student from "../models/Student.js";
import Referral from "../models/Referral.js";
import Webinar from "../models/Webinar.js";
import StudentWebinarBooking from "../models/StudentWebinarBooking.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Payout from "../models/Payout.js";
import User from "../models/User.js";
import WebinarReferralCode from "../models/WebinarReferralCode.js";


// Generate unique referral code
const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * PATCH : /student/bank-details
 */
export const setBankDetails = async (req, res) => {
    try {
        const { studentId, bankName, accountNumber, ifscCode, accountHolderName } = req.body;
        const student = await Student.findByIdAndUpdate(
            studentId,
            { bankName, accountNumber, ifscCode, accountHolderName },
            { new: true }
        );
        if (!student) {
            return res.status(StatusCodes.NOT_FOUND).json({ ...ErrorResponse, message: "Student not found" });
        }
        SuccessResponse.data = student;
        SuccessResponse.message = "Bank details updated successfully";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
};

/**
 * POST : /student/validate-referral
 */
export const validateReferralCode = async (req, res) => {
    try {
        const { referralCode, webinarId } = req.body;
        
        // 1. Check webinar-specific codes
        const webinarCodeQuery = { code: { $regex: new RegExp("^" + referralCode + "$", "i") } };
        if (webinarId) {
            webinarCodeQuery.webinar = webinarId;
        }
        
        const webinarCode = await WebinarReferralCode.findOne(webinarCodeQuery);
        if (webinarCode) {
            SuccessResponse.data = { valid: true, type: "WEBINAR" };
            SuccessResponse.message = "Webinar referral code is valid";
            return res.status(StatusCodes.OK).json(SuccessResponse);
        }

        // 2. Check User model (global code)
        const user = await User.findOne({ referalCode: { $regex: new RegExp("^" + referralCode + "$", "i") } });
        
        if (user) {
            SuccessResponse.data = { valid: true, type: "GLOBAL" };
            SuccessResponse.message = "Global referral code is valid";
            return res.status(StatusCodes.OK).json(SuccessResponse);
        }

        // 3. Check Student model (global code)
        const student = await Student.findOne({ referralCode: { $regex: new RegExp("^" + referralCode + "$", "i") } });
        
        if (student) {
            SuccessResponse.data = { valid: true, type: "GLOBAL" };
            SuccessResponse.message = "Global referral code is valid";
            return res.status(StatusCodes.OK).json(SuccessResponse);
        }
        
        return res.status(StatusCodes.NOT_FOUND).json({ 
            ...ErrorResponse, 
            message: "Invalid referral code" 
        });
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
};

/**
 * POST : /student/generate-referral
 */
export const generateReferralCode = async (req, res) => {
    try {
        const { studentId, webinarId } = req.body;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(StatusCodes.NOT_FOUND).json({ ...ErrorResponse, message: "Student not found" });
        }

        if (webinarId) {
            const webinar = await Webinar.findById(webinarId);
            if (!webinar) {
                return res.status(StatusCodes.NOT_FOUND).json({ ...ErrorResponse, message: "Webinar not found" });
            }

            // Check if code already exists for this webinar
            let webinarReferral = await WebinarReferralCode.findOne({ student: studentId, webinar: webinarId });
            if (!webinarReferral) {
                const code = generateUniqueCode();
                webinarReferral = await WebinarReferralCode.create({
                    student: studentId,
                    webinar: webinarId,
                    code: code
                });
            }
            SuccessResponse.data = { referralCode: webinarReferral.code };
            SuccessResponse.message = "Webinar-specific referral code generated successfully";
            return res.status(StatusCodes.OK).json(SuccessResponse);
        }

        // Global fallback (original logic)
        if (!student.referralCode) {
            const code = generateUniqueCode();
            student.referralCode = code;
            await student.save();
            
            // Sync with User model if possible
            if (student.user) {
                await User.findByIdAndUpdate(student.user, { referalCode: code });
            }
        }

        SuccessResponse.data = { referralCode: student.referralCode };
        SuccessResponse.message = "Global referral code generated successfully";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
};


/**
 * POST : /webinar/book
 */
export const bookWebinar = async (req, res) => {
    try {
        const { studentId, webinarId, referralCode, useWallet } = req.body;
        let student = await Student.findById(studentId);
        if (!student) {
            // Try finding student by user ID
            student = await Student.findOne({ user: studentId });
        }
        const webinar = await Webinar.findById(webinarId);

        if (!student || !webinar) {
            return res.status(StatusCodes.NOT_FOUND).json({ ...ErrorResponse, message: "Student or Webinar not found" });
        }

        // Ensure we have a user ID for transactions
        const studentUserId = student.user || (await User.findById(studentId) ? studentId : null);
        if (!studentUserId) {
             return res.status(StatusCodes.BAD_REQUEST).json({ ...ErrorResponse, message: "Student is not linked to a valid user" });
        }


        let price = 9;
        let referrer = null;

        // 1. If code provided, use it
        if (referralCode) {
            // First check webinar-specific code
            const webinarSpecificReferral = await WebinarReferralCode.findOne({ 
                code: { $regex: new RegExp("^" + referralCode + "$", "i") }, 
                webinar: webinarId 
            });

            if (webinarSpecificReferral) {
                referrer = await Student.findById(webinarSpecificReferral.student);
            } else {
                // Check if it's a global code (User model)
                const userReferrer = await User.findOne({ 
                    referalCode: { $regex: new RegExp("^" + referralCode + "$", "i") } 
                });
                if (userReferrer) {
                    referrer = await Student.findOne({ user: userReferrer._id });
                }
            }
        }
        
        // 2. If NO code provided, check if the student was referred during signup
        if (!referrer && student.user) {
            const studentUser = await User.findById(student.user);
            if (studentUser && studentUser.refer_by) {
                referrer = await Student.findOne({ user: studentUser.refer_by });
            }
        }

        if (referrer && referrer._id.toString() !== studentId) {
            price = 8;
        }

        let amountToPay = price;
        let walletDeduction = 0;

        // Wallet logic: deduct from walletBalance if requested
        if (useWallet && student.walletBalance > 0) {
            walletDeduction = Math.min(student.walletBalance, amountToPay);
            amountToPay -= walletDeduction;
        }

        // Create booking
        const booking = await StudentWebinarBooking.create({
            student: studentId,
            webinar: webinarId,
            amountPaid: amountToPay,
            walletUsed: walletDeduction,
            referralCodeUsed: referralCode,
            paymentStatus: "COMPLETED" // Assuming payment is handled or ₹0
        });

        // Update wallet balance if used
        if (walletDeduction > 0) {
            student.walletBalance -= walletDeduction;
            await student.save();
            await WalletTransaction.create({
                user: studentUserId,
                type: "DEBIT",
                amount: walletDeduction,
                remarks: `Used wallet for webinar ${webinar.title}`,
                status: "COMPLETED"
            });

        }

        // Record referral for earning (now credited immediately upon booking)
        if (referrer && price === 8) {
            const referralCount = await Referral.countDocuments({ 
                referrer: referrer._id, 
                webinar: webinarId,
                status: { $in: ["EARNED", "COMPLETED", "ATTENDED"] } 
            });

            await Referral.create({
                referrer: referrer._id,
                referred: student._id,
                webinar: webinarId,
                status: "EARNED" // Set as earned right away upon booking
            });

            // Credit ₹1 to referrer wallet (up to a limit, e.g., 100 or no limit. Previously it was 10, let's keep 10)
            if (referralCount < 10) {
                referrer.walletBalance += 1;
                await referrer.save();

                // Log the wallet transaction
                if (referrer.user) {
                    await WalletTransaction.create({
                        user: referrer.user,
                        type: "CREDIT",
                        amount: 1,
                        remarks: `Referral bonus: friend booked webinar`,
                        status: "COMPLETED"
                    });
                }

            }

            // ALSO: Award a gift coupon to the referred student (attendee) for their first booking
            const attendeeUser = await User.findById(student.user || studentId);
            if (attendeeUser) {
                const alreadyHasGift = attendeeUser.earnedCoupons?.some(c => c.code === "WEBINAR_GIFT");
                if (!alreadyHasGift) {
                    if (!attendeeUser.earnedCoupons) attendeeUser.earnedCoupons = [];
                    attendeeUser.earnedCoupons.push({
                        code: "WEBINAR_GIFT",
                        description: "First Webinar Booking Gift Coupon - Use for next booking!"
                    });
                    await attendeeUser.save();
                }
            }
        }

        SuccessResponse.data = { booking, finalPrice: price, paidFromWallet: walletDeduction, paidCash: amountToPay };
        SuccessResponse.message = "Webinar booked successfully. Notifications will be sent according to schedule.";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
};

/**
 * POST : /webinar/mark-attendance
 */
export const markAttendanceAndCreditReferrer = async (req, res) => {
    try {
        const { studentId, webinarId } = req.body;

        const booking = await StudentWebinarBooking.findOne({ student: studentId, webinar: webinarId });
        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({ ...ErrorResponse, message: "Booking not found" });
        }

        if (booking.attendanceStatus === "ATTENDED") {
            return res.status(StatusCodes.BAD_REQUEST).json({ ...ErrorResponse, message: "Attendance already marked" });
        }

        booking.attendanceStatus = "ATTENDED";
        await booking.save();

        // Check if this student was referred
        const referral = await Referral.findOne({ referred: studentId, webinar: webinarId, status: "EARNED" }); // Now it will be EARNED

        if (referral) {
            referral.status = "ATTENDED"; // Mark as fully completed
            await referral.save();
        }

        SuccessResponse.message = "Attendance marked successfully";
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
};

/**
 * POST : /student/redeem
 */
export const redeemEarnings = async (req, res) => {
    try {
        const { studentId, amount, option } = req.body; // option: "BANK" or "WALLET"
        const student = await Student.findById(studentId);

        if (!student || student.walletBalance < amount) {
            return res.status(StatusCodes.BAD_REQUEST).json({ ...ErrorResponse, message: "Invalid student or insufficient balance" });
        }

        if (option === "WALLET") {
            // Earnings are already in walletBalance in this implementation
            SuccessResponse.message = "Earnings are already available in your wallet for next purchase";
        } else if (option === "BANK") {
            if (!student.bankName || !student.accountNumber) {
                return res.status(StatusCodes.BAD_REQUEST).json({ ...ErrorResponse, message: "Bank details not set" });
            }

            // Create a payout request for admin/institute
            const payout = await Payout.create({
                user: student.user,
                userType: "STUDENT",
                requestedAmount: amount,
                paymentMethod: "BANK",
                status: "REQUESTED"
            });

            // Deduct from wallet immediately to prevent double redeem
            student.walletBalance -= amount;
            await student.save();

            await WalletTransaction.create({
                user: student.user,
                type: "DEBIT",
                amount: amount,
                remarks: `Redeem request to bank: Payout ID ${payout._id}`,
                status: "PENDING"
            });

            SuccessResponse.data = payout;
            SuccessResponse.message = "Redeem request submitted to admin/institute";
        }

        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
};
