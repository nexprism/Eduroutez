import { StatusCodes } from "http-status-codes";
import ActivityService from "../services/activity-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";

const activityService = new ActivityService();

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const response = await activityService.getUserActivity(userId, page, limit);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched user activity";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    const response = await activityService.getRecentActivity(userId, limit);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched recent activity";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

export const getActivityStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const response = await activityService.getActivityStats(userId);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched activity stats";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};
