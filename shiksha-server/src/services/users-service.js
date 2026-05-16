import { UserRepository, ReddemHistryRepository, CounselorRepository } from "../repository/index.js";
import Referral from "../models/Referral.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import StudentWebinarBooking from "../models/StudentWebinarBooking.js";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/errors/app-error.js";
import mongoose from "mongoose";
class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.reddemHistryRepository = new ReddemHistryRepository();
    this.counsellorRepository = new CounselorRepository();

  }

  async getlist() {
    try {
      const users = await this.userRepository.getALL();
      return users;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getlist() {
    try {
      const users = await this.userRepository.getALL();
      return users;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async create(data) {
    try {
      const user = await this.userRepository.create(data);
      return user;
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
      const usersData = await this.userRepository.getAll(filterConditions, sortConditions, pageNum, limitNum);

      // Populate counselor verification data for each counselor in the list
      if (usersData && usersData.result) {
        for (let i = 0; i < usersData.result.length; i++) {
          let user = usersData.result[i];
          let userObj = user.toObject ? user.toObject() : user;

          if (userObj.role === 'counsellor') {
            const counselor = await this.counsellorRepository.getByid(userObj._id);
            if (counselor) {
              userObj.verificationStatus = counselor.verificationStatus;
              userObj.isVerified = counselor.isVerified;
              userObj.verifiedBadge = counselor.verifiedBadge;
              userObj.certificateUrl = counselor.certificateUrl;
            }
          }
          usersData.result[i] = userObj;
        }
      }

      return usersData;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }



  async getCounselors() {
    try {
      // Add role filter for counselors
      const filterConditions = { role: "counselor" };

      // Execute query without sorting and pagination
      const counselors = await this.userRepository.getlist(filterConditions);

      return counselors;
    } catch (error) {
      throw new AppError("Cannot fetch data of all the counselors", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async getUserByReferalCode(referalCode) {
    try {
      // Check both 'referalCode' (single r) and 'referralCode' (double r)
      let user = await this.userRepository.findBy({ referalCode });
      if (!user) {
        user = await this.userRepository.findBy({ referralCode: referalCode });
      }
      return user;
    } catch (error) {
      throw error;
    }
  }


  ////update referalUser my_referrals
  async updateReferalUser(referalUser, userId) {
    try {
      // Ensure we keep existing referrals and append the new one once
      const my_referrals = Array.isArray(referalUser.my_referrals)
        ? [...referalUser.my_referrals]
        : [];

      const userIdStr = userId.toString();
      const alreadyReferred = my_referrals.some((id) => id.toString() === userIdStr);

      if (!alreadyReferred) {
        my_referrals.push(userId);
      }

      const referdata = {
        my_referrals,
        points: (referalUser.points || 0) + 50,
      };

      const referalUserPayload = { ...referdata };

      // console.log('referalUserPayload',referalUserPayload)

      const referalUserResponse = await this.userRepository.update(referalUser._id, referalUserPayload);

      return referalUserResponse;
    } catch (error) {
      throw error;
    }
  }

  // Compute "my coupons" based on referral count (e.g. 1 coupon after 9 referrals)
  async getMyCoupons(userId) {
    try {
      // Use the EXACT same logic as getMyRefferal to ensure the UI and backend match 100%
      const allReferrals = await this.getMyRefferal(userId);
      
      // Filter for those that actually booked the webinar
      const completedReferrals = allReferrals.filter(ref => ref.webinarBooked);
      const referralCount = completedReferrals.length;

      const hasWebinarCoupon = referralCount >= 9;
      const coupons = [];

      if (hasWebinarCoupon) {
        coupons.push({
          code: "WEBINAR9",
          description: "Webinar referral reward coupon for 9 successful referrals.",
          referralCount,
        });
      }

      // Also include specific earned coupons from the user record
      const user = await this.userRepository.get(userId);
      if (user && user.earnedCoupons && user.earnedCoupons.length > 0) {
        user.earnedCoupons.forEach(c => {
          coupons.push({
            code: c.code,
            description: c.description,
            earnedAt: c.earnedAt
          });
        });
      }

      return { referralCount, coupons };
    } catch (error) {
      throw new AppError(
        "Cannot fetch data of my coupons",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async redeemPoints(userId, points) {
    try {

      const user = await this.userRepository.getById(userId);

      const updatedPoints = user.points - points;
      const updatedBalance = user.balance + points / 2;

      const payload = {
        points: updatedPoints,
        balance: updatedBalance,
      };

      const reddemHistryPayload = {
        user: userId,
        points: points,
        remarks: points + " points redeemed",
      };

      if (user.role == 'cousellor') {
        // console.log('user.role:', user.role);
        const response = await this.counsellorRepository.update(userId, payload);
        const reddemHistryResponse = await this.reddemHistryRepository.create(reddemHistryPayload);
        return response;
      } else {
        const response = await this.userRepository.update(userId, payload);
        //  console.log('response:', response);
        const reddemHistryResponse = await this.reddemHistryRepository.create(reddemHistryPayload);
        return response;
      }



    } catch (error) {
      throw error;
    }
  }

  //earningReports
  async earningReports(userId = '') {
    try {
      const user = await this.userRepository.earningReports(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  //dashboard
  async dashboard(userId = '') {
    try {
      const user = await this.userRepository.dashboardDetails(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  //instituteDashboard
  async instituteDashboard(userId = '') {
    try {
      const user = await this.userRepository.instituteDashboard(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  //updateAllSlugs(model)
  async updateAllSlugs(model) {
    try {
      const user = await this.userRepository.updateAllSlugs(model);
      return user;
    } catch (error) {
      throw error;
    }
  }


  //counselorDashboard
  async counselorDashboard(userId) {
    try {
      const user = await this.userRepository.counselorDashboard(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  //likeDislike
  async likeDislike(userId, courseId, like, type) {
    try {
      const user = await this.userRepository.likeDislike(userId, courseId, like, type);
      return user;
    } catch (error) {
      throw error;
    }
  }

  //submitReview
  async submitReview(itemId, reviewpayload, type) {
    try {
      const user = await this.userRepository.submitReview(itemId, reviewpayload, type);
      return user;
    } catch (error) {
      throw error;
    }
  }

  //sendSms
  async sendSms(userId, message) {
    try {
      const user = await this.userRepository.getById(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }


  //getRedeemHistory
  async getRedeemHistory(userId) {
    try {
      const response = await this.reddemHistryRepository.getAll({ user: userId });
      return response;
    } catch (error) {
      throw error;
    }
  }


  //getMyRefferal
  async getMyRefferal(id) {
    try {
      const objId = new mongoose.Types.ObjectId(id);
      const history = [];

      // 1. Find the User and their Student profile
      const currentUser = await User.findById(objId);
      const student = await Student.findOne({ user: objId });
      const studentId = student ? student._id : null;
      
      const myCode = currentUser?.referalCode || student?.referralCode;

      // Search IDs: The user might be stored as either their User ID or Student ID in different parts of the system
      const searchIds = [objId];
      if (studentId) searchIds.push(studentId);

      // 2. Search Referral collection (Direct webinar booking rewards)
      const webinarReferrals = await Referral.find({
        referrer: { $in: searchIds }
      }).populate({
          path: 'referred',
          select: 'name createdAt user'
      }).populate({
          path: 'webinar',
          select: 'title'
      }).sort({ createdAt: -1 });

      webinarReferrals.forEach(r => {
        if (!r.referred) return;
        const friendUserId = r.referred.user?.toString();
        const friendStudentId = r.referred._id?.toString();
        
        history.push({
            id: friendUserId || friendStudentId || r._id.toString(),
            userId: friendUserId,
            studentId: friendStudentId,
            name: r.referred.name || "Friend",
            webinarId: r.webinar?._id,
            webinarTitle: r.webinar?.title,
            createdAt: r.createdAt,
            status: r.status,
            webinarBooked: true,
            webinarAttended: ["EARNED", "ATTENDED", "REDEEMED"].includes(r.status)
        });
      });

      // 3. Search User collection (Signup referrals)
      const signupQuery = {
        $or: [
            { refer_by: { $in: searchIds } },
            { refer_by: { $in: searchIds.map(sid => sid.toString()) } },
            { referredBy: { $in: searchIds } },
            { referredBy: { $in: searchIds.map(sid => sid.toString()) } }
        ]
      };
      
      // Also check the User's own referral tracking array
      if (currentUser?.my_referrals && currentUser.my_referrals.length > 0) {
        signupQuery.$or.push({ _id: { $in: currentUser.my_referrals } });
      }

      const overallUsers = await User.find(signupQuery).sort({ createdAt: -1 });
      overallUsers.forEach(user => {
        const userIdStr = user._id.toString();
        const existing = history.find(h => h.userId === userIdStr || h.id.toString() === userIdStr);
        
        if (!existing) {
            history.push({
                id: userIdStr,
                userId: userIdStr,
                name: user.name || "Friend",
                createdAt: user.createdAt,
                status: "Signed Up",
                webinarBooked: false,
                webinarAttended: false
            });
        }
      });

      // 4. Fallback: Search in StudentWebinarBooking by Referral Code
      if (myCode) {
        const bookingsWithMyCode = await StudentWebinarBooking.find({
            referralCodeUsed: { $regex: new RegExp("^" + myCode + "$", "i") },
            student: { $ne: studentId }
        }).populate({
            path: 'student',
            select: 'name createdAt user'
        }).populate({
            path: 'webinar',
            select: 'title'
        }).sort({ bookedAt: -1 });

        bookingsWithMyCode.forEach(booking => {
            if (!booking.student) return;
            const friendUserId = booking.student.user?.toString();
            const friendStudentId = booking.student._id?.toString();

            const existing = history.find(h => 
                (friendUserId && h.userId === friendUserId) ||
                (friendStudentId && h.studentId === friendStudentId)
            );
            
            if (existing) {
                existing.webinarBooked = true;
                if (existing.status === "Signed Up") existing.status = "Booked";
                if (!existing.webinarId) {
                    existing.webinarId = booking.webinar?._id;
                    existing.webinarTitle = booking.webinar?.title;
                }
                if (booking.attendanceStatus === "ATTENDED") existing.webinarAttended = true;
            } else {
                history.push({
                    id: friendUserId || friendStudentId,
                    userId: friendUserId,
                    studentId: friendStudentId,
                    name: booking.student.name || "Friend",
                    webinarId: booking.webinar?._id,
                    webinarTitle: booking.webinar?.title,
                    createdAt: booking.bookedAt,
                    status: "Booked",
                    webinarBooked: true,
                    webinarAttended: booking.attendanceStatus === "ATTENDED"
                });
            }
        });
      }

      // Final sort: newest first
      history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return history;
    } catch (error) {
      console.error("Error in getMyRefferal:", error);
      throw error;
    }
  }


  async getAllRefferal() {
    try {
      const allHistory = [];

      // 1. Get Signup-based referrals (from User model)
      const signupReferrals = await User.find({ refer_by: { $ne: null } })
        .populate('refer_by', 'name email')
        .sort({ createdAt: -1 });

      signupReferrals.forEach(user => {
        allHistory.push({
          referrer: user.refer_by,
          referred: {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          },
          type: 'SIGNUP',
          status: 'Signed Up',
          createdAt: user.createdAt
        });
      });

      // 2. Get Webinar-based referrals (from Referral model)
      const webinarReferrals = await Referral.find({})
        .populate('referrer', 'name email')
        .populate('referred', 'name email')
        .populate('webinar', 'title')
        .sort({ createdAt: -1 });

      webinarReferrals.forEach(ref => {
        allHistory.push({
          referrer: ref.referrer,
          referred: ref.referred,
          webinar: ref.webinar,
          type: 'WEBINAR',
          status: ref.status,
          createdAt: ref.createdAt
        });
      });

      // Sort combined history by date
      allHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return allHistory;
    } catch (error) {
      console.error('Error fetching referral data:', error.message);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      console.log('id', id);
      const user = await this.userRepository.getById(id);

      return user;
    } catch (error) {
      throw error;
    }
  }


  async update(id, data) {

    try {
      const institute = await this.userRepository.update(id, data);

      return institute;
    } catch (error) {
      throw new AppError("Cannot update the user ", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }



}

export default UserService;

/*
    this is my #first #tweet . I am really #excited
*/
