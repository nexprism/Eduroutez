import User from "../models/User.js";
import State from "../models/States.js";
import City from "../models/Cities.js";
import Subscription from "../models/Subscription.js";
import PromotionTransaction from "../models/PromotionTransaction.js";
import Promotion from "../models/Promotion.js";
import Transaction from "../models/Transaction.js";
import CrudRepository from "./crud-repository.js";
import ScheduleSlot from "../models/ScheduleSlots.js";
import ReddemHistry from "../models/ReddemHistry.js";
import Query from "../models/Query.js";
import Course from "../models/Course.js";
import Counselor from "../models/Counselor.js";

class UserRepository extends CrudRepository {
  constructor() {
    super(User);
  }

  //getStates
  async getStates() {
    try {
      const states = await State.find({country_id: 101});
      return states;
    } catch (error) {
      throw error;
    }
  }

  //getCityByState
  async getCityByState(stateId) {
    try {

    const cities = await City.find({state_id:stateId });

    console.log('cities',cities);
      return cities;
    }
    catch (error) {
      throw error;
    }

  }

  //earningReports
  async earningReports() {
    try {
      //get total of amount from transaction all records
      const totalSubscription = await Transaction.aggregate([
        {
          $group: {
            _id: 'subscription_income',
            total: { $sum: "$amount" },
          },
        },
      ]);

      // Get all approved promotions
      const approvedPromotions = await Promotion.find({ status: 'approved' });

      // Get the sum of amounts from promotion transactions for approved promotions
      const promotionIncome = await PromotionTransaction.aggregate([
        {
          $match: {
            promotionId: { $in: approvedPromotions.map(promotion => promotion._id) }
          }
        },
        {
          $group: {
        _id: 'listed_ads_income',
        total: { $sum: "$amount" },
          },
        },
      ]);

      //unlisted ads income
      const pendingPromotions = await Promotion.find({ status: 'pending' });

      // Get the sum of amounts from promotion transactions for approved promotions
      const unlistedpromotionIncome = await PromotionTransaction.aggregate([
        {
          $match: {
            promotionId: { $in: pendingPromotions.map(promotion => promotion._id) }
          }
        },
        {
          $group: {
            _id: 'unlisted_ads_income',
            total: { $sum: "$amount" },
          },
        },
      ]);

      // Get all completed schedule slots
      const completedScheduleSlots = await ScheduleSlot.find({ status: 'completed' });

      // Calculate the total amount for completed schedule slots
      const completedScheduleIncome = completedScheduleSlots.length * 500 * 0.70;

      const counselorIcome = {
        _id: 'counselor_income',
        total: completedScheduleIncome,
      };


      const completedCounselorShares = completedScheduleSlots.length * 500 * 0.30;

      const counselorShares = {
        _id: 'counselor _shares',
        total: completedCounselorShares,
      };


      // Get all redeem history requests with status 'COMPLETED'
      const complatedRedeemRequests = await ReddemHistry.find({ status: 'COMPLETED' });

      // Calculate the total points for completed redeem requests
      const totalPendingPoints = complatedRedeemRequests.reduce((acc, request) => acc + request.points, 0);

      const redeemInfo = {
        _id: 'redeem_requests',
        count: complatedRedeemRequests.length,
        totalPoints: totalPendingPoints,
      };


      






      const response = {
          totalSubscription,
          promotionIncome,  
          unlistedpromotionIncome,
          counselorIcome,
          counselorShares,
          redeemInfo
      };



      return response;


      
    }
    catch (error) {
      console.log('error',error.message); 
      throw error;
    }
  }

  //dashboardDetails
  async dashboardDetails() {
    try {
      //get user by id
      const users = await User.find({ role: 'institute' }).populate("plan");
      const students = await User.find({ role: 'student' });
      const counsellor = await User.find({ role: 'counsellor' });

      const activeSubscriptionCount = await User.countDocuments({
        role: 'institute',
        expiryDate: { $gt: new Date() },
        plan: { $exists: true, $ne: null }
      }).populate({
        path: 'plan',
        match: { price: { $gt: 0 } }
      });


      const renewSubscriptionCount = await User.countDocuments({
        role: 'institute',
        expiryDate: { $lt: new Date() },
        plan: { $exists: true, $ne: null }
      }).populate({
        path: 'plan',
        match: { price: { $gt: 0 } }
      });


      //total leads from Query
      const totalLeads = await Query.countDocuments({});

      //all pending and desc transaction from Transaction
      const newSubscriptions = await Transaction.find({ status: 'pending' }).sort({ createdAt: -1 });

      var totalEarning = 0;
     const earning = await this.earningReports().then((response) => {
        // console.log('earningReports response', response.totalSubscription[0].total);
          return totalEarning = parseInt(response.totalSubscription[0].total) + parseInt(response.promotionIncome[0].total) + parseInt(response.unlistedpromotionIncome[0].total) ;
      });


      const saparteEarning = await this.earningReports().then((response) => {
        // console.log('earningReports response', response.totalSubscription[0].total);

        var subscriptionIncome = parseInt(response.totalSubscription[0].total);
        var promotionIncome = parseInt(response.promotionIncome[0].total);

        return {
          subscriptionIncome,
          promotionIncome
        };
      });

      // console.log('totalEarning', earning);

      //Pending query count
      const newLeads = await Query.countDocuments({ status: 'Pending' });


      const response = {
        totalInstitutes: users.length,
        activeSubscriptionCount,
        totalLeads,
        newSubscriptions,
        totalEarning,
        totalStudents: students.length,
        totalCounsellor: counsellor.length,
        renewSubscriptionCount,
        saparteEarning,
        newLeads
      };
      
      return response;
    }
    catch (error) {
      throw error;
    }
  }

  //instituteDashboard  
  async instituteDashboard(instituteId) {
    try {
      
      //get course count by institute
      const courses = await Course.find({ instituteCategory: instituteId });

      //get query count by institute
      const queries = await Query.find({ instituteId: instituteId });

      const newQueries = await Query.find({ instituteId: instituteId, status: 'Pending' });


    const response = {
      totalCourses: courses.length,
      totalLeads: queries.length,
      newLeads: newQueries.length,
    };

    return response;

    }catch (error) {
      throw error;
    }
  }

  //counselorDashboard
  async counselorDashboard(counselorId) {
    try {
      //get all schedule slots by counselor
      const scheduleSlots = await ScheduleSlot.find({ counselor: counselorId });

      const earning = scheduleSlots.length * 500 * 0.30; 



      //get all completed schedule slots by counselor
      const completedScheduleSlots = await ScheduleSlot.find({ counselor: counselorId, status: 'completed' });

      //pending schedule slots
      const pendingScheduleSlots = await ScheduleSlot.find({ counselor: counselorId, status: 'pending' });

      const counselor = await Counselor.findById(counselorId);
      var averageRating = 0;
      if (counselor.reviews) {

        const totalRating = counselor.reviews.reduce((acc, review) => acc + review.rating, 0);
         averageRating = totalRating / counselor.reviews.length;

      }
    
      const response = {
        earning,
        completedSlots: completedScheduleSlots.length,
        totalSlots: scheduleSlots.length,
        pendingSlots: pendingScheduleSlots.length,
        averageRating
    };

      return response;
    } catch (error) {
      throw error;
    }
  }


  async get(email) {
    const student = await User.findOne({ email }).populate("plan");
    return student;
  }
  

  async getById(id) {
    const student  = await User.findById(id).populate("plan");
    return student;
  }

  async findBy(data) {
    try {
      //get user with popuplate plan
      const response = await User.findOne(data).populate("plan");
      return response;
    } catch (error) {
      throw error;
    }
  }

  // getAll tieht .populate('refer_by')
  async getAll(query) {
    try {
      const response = await User.find(query);

      if(query.refer_by && query.plan) {
        response = await User.find(query).populate('refer_by').populate('plan');
      }
      

      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export { UserRepository };
