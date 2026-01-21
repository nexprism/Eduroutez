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
import Blog from "../models/Blog.js";
import Career from "../models/Career.js";
import { response } from "express";
import randomstring from "randomstring";
import { InstituteRepository } from "./index.js";
import { CourseRepository } from "./index.js";



class UserRepository extends CrudRepository {
  constructor() {
    super(User);
    this.instituteRepository = new InstituteRepository();
    this.courseRepository = new CourseRepository();
  }

  //getStates
  async getStates() {
    try {
      const states = await State.find({ country_id: 101 });
      return states;
    } catch (error) {
      throw error;
    }
  }

  //getCityByState
  async getCityByState(stateId) {
    try {

      const cities = await City.find({ state_id: stateId });

      console.log('cities', cities);
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
      ]).allowDiskUse(true);

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
      ]).allowDiskUse(true);

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
      ]).allowDiskUse(true);

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
      console.log('error', error.message);
      throw error;
    }
  }

  //getStatesCities
  async getStatesCities(search = '') {
    try {
      //get states and cities with search query if search is empty return all states and cities

      console.log('search', search);

      const states = await State.find({ country_id: 101, name: { $regex: search, $options: 'i' } });
      const cities = await City.find({ name: { $regex: search, $options: 'i' } });
      return [...states, ...cities];

      //merge states and cities


    } catch (error) {

      throw error;
    }
  }

  //getStateCityById
  async getStateCityById(id, type) {
    try {
      //get state or city by id
      if (type === 'state') {
        const state = await State.find({ id: id });
        return state;
      } else {
        const city = await City.find({ id: id });
        return city;
      }
    } catch (error) {
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
        return totalEarning = parseInt(response.totalSubscription[0].total) + parseInt(response.promotionIncome[0].total) + parseInt(response.unlistedpromotionIncome[0].total);
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

    } catch (error) {
      throw error;
    }
  }
  //likeDislike
  async likeDislike(userId, courseId, like, type) {
    try {
      if (type === 'course') {
        var model = Course;
      } else if (type === 'blog') {
        var model = Blog;
      } else {
        var model = Career;
      }

      //get course by id
      const item = await model.findById(courseId);
      if (like == 1) {
        item.likes.push(userId);
      } else {
        //pull user from likes array
        item.likes.pull(userId);

      }

      //save course
      await item.save();
      return item;
    } catch (error) {
      throw error;
    }
  }

  //submitReview
  async submitReview(itemId, reviewpayload, type) {
    try {
      if (type === 'course') {
        var model = Course;
      } else if (type === 'blog') {
        var model = Blog;
      }
      else {
        var model = Career;
      }

      //get course by id
      console.log('itemId', itemId);
      console.log('model', model);
      const item = await model.findById(itemId);
      if (!item) {
        throw new Error(`${type} not found`);
      }
      //push review to reviews array
      item.reviews.push(reviewpayload);
      //save course
      await item.save();
      return item;
    }
    catch (error) {
      throw error;
    }
  }



  //counselorDashboard
  async counselorDashboard(counselorId) {
    try {
      console.log('counselorId', counselorId);
      //get all schedule slots by counselor
      const scheduleSlots = await ScheduleSlot.find({ counselorId: counselorId });

      const counsellor_user = await User.findById(counselorId);
      var commissionrate = 30;
      commissionrate = counsellor_user.commission / 100;
      const earning = counsellor_user.balance;

      console.log('counsellor_user', counsellor_user);
      var level = counsellor_user.level;
      var points = counsellor_user.points;
      var balance = counsellor_user.balance;




      //get all completed schedule slots by counselor
      const completedScheduleSlots = await ScheduleSlot.find({ counselorId: counselorId, status: 'completed' });

      //pending schedule slots
      const pendingScheduleSlots = await ScheduleSlot.find({ counselorId: counselorId, status: 'scheduled' });


      const counselor = await Counselor.findById(counsellor_user._id);
      var averageRating = 0;
      if (counselor.reviews) {

        const totalRating = counselor.reviews.reduce((acc, review) => acc + review.rating, 0);
        console.log('totalRating', totalRating);
        averageRating = totalRating / counselor.reviews.length;
        console.log('averageRating', averageRating);

      }

      const response = {
        earning,
        completedSlots: completedScheduleSlots.length,
        totalSlots: scheduleSlots.length,
        pendingSlots: pendingScheduleSlots.length,
        averageRating,
        level,
        points,
        balance
      };


      console.log('dash response', response);

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
    var student = await User.findById(id);
    if (student.plan) {
      student = await User.findById(id).populate("plan");
    }
    return student;
  }

  async findBy(data) {
    try {
      //get user with popuplate plan
      var response = await User.findOne(data).populate("plan")

      return response;
    } catch (error) {
      throw error;
    }
  }

  // getAll tieht .populate('refer_by')
  async getAll(query) {
    try {
      const response = await User.find(query);

      if (query.refer_by && query.plan) {
        response = await User.find(query).populate('refer_by').populate('plan');
      }



      return response;
    } catch (error) {
      throw error;
    }
  }

  //updateAllSlugs
  async updateAllSlugs(type) {
    try {
      let model;
      if (type === 'course') {
        model = Course;
      } else if (type === 'blog') {
        model = Blog;
      } else {
        model = Career;
      }

      const items = await model.find({});
      console.log('items length', items.length);

      const results = {
        totalItems: items.length,
        successfulUpdates: 0,
        failedUpdates: [],
        instituteUpdateResults: {
          successful: 0,
          skipped: 0,
          failed: 0
        }
      };

      for (const item of items) {
        try {
          // Generate new slug
          item.slug = item.courseTitle.toLowerCase().replace(/ /g, "-") + '-' + randomstring.generate(5);
          const payload = {
            slug: item.slug
          };

          // Update in original model
          const updatedItem = await this.courseRepository.update(item._id, payload);
          results.successfulUpdates++;

          // Try to update in institute, but don't stop if it fails
          if (item.instituteCategory) {
            try {
              const instituteUpdateResult = await this.instituteRepository.updateCourse(item.instituteCategory, item._id, updatedItem);

              // Check the result from the improved updateCourse function
              if (instituteUpdateResult.success) {
                results.instituteUpdateResults.successful++;
              } else if (instituteUpdateResult.skipped) {
                results.instituteUpdateResults.skipped++;
                console.log(`Skipped institute update for course ${item._id}: ${instituteUpdateResult.reason}`);
              } else {
                results.instituteUpdateResults.failed++;
                console.log(`Failed institute update for course ${item._id}: ${instituteUpdateResult.error}`);
              }
            } catch (instituteError) {
              results.instituteUpdateResults.failed++;
              console.error(`Error updating course in institute: ${instituteError.message}`);
            }
          }
        } catch (itemError) {
          results.failedUpdates.push({
            itemId: item._id,
            error: itemError.message
          });
          console.error(`Failed to update slug for item ${item._id}: ${itemError.message}`);
        }
      }

      return {
        totalItems: results.totalItems,
        message: 'Slug update process completed',
        successfulItemUpdates: results.successfulUpdates,
        failedItemUpdates: results.failedUpdates.length,
        instituteUpdates: results.instituteUpdateResults
      };
    } catch (error) {
      console.error(`Error in updateAllSlugs: ${error.message}`);
      throw error;
    }
  }
}


export { UserRepository };
