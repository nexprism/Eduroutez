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
