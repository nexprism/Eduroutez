import { StatusCodes } from "http-status-codes";
import FeedbackService from "../services/feedback-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const feedbackService = new FeedbackService();

/**
 * POST : /feedback
 * req.body {}
 */
export const createFeedback = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.image = req.file.filename;

    const response = await feedbackService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a feedback";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /feedback
 * req.body {}
 */

export async function getFeedbacks(req, res) {
  try {
    const response = await feedbackService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched feedbacks";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /feedback/:id
 * req.body {}
 */

export async function getFeedback(req, res) {
  try {
    const response = await feedbackService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the feedback";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /feedback/:id
 * req.body {capacity:200}
 */

export async function updateFeedback(req, res) {
  try {
    const feedbackId = req.params.id;
    const payload = {};

    if (req.body.title) {
      payload.title = req.body.title;
    }

    const response = await feedbackService.update(feedbackId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the feedback";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update feedback error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /feedback/:id
 * req.body {}
 */

export async function deleteFeedback(req, res) {
  try {
    const response = await feedbackService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the feedback";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
