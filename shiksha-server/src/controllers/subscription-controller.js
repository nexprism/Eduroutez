import { StatusCodes } from "http-status-codes";
import SubscriptionService from "../services/subscription-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const subscriptionService = new SubscriptionService();

/**
 * POST : /subscription
 * req.body {}
 */
export const createSubscription = async (req, res) => {
  try {
    const payload = { ...req.body };

    const response = await subscriptionService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a subscription";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /subscription
 * req.body {}
 */

export async function getSubscriptions(req, res) {
  try {
    const response = await subscriptionService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched subscriptions";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /subscription/:id
 * req.body {}
 */

export async function getSubscription(req, res) {
  try {
    const response = await subscriptionService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the subscription";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /subscription/:id
 * req.body {capacity:200}
 */

export async function updateSubscription(req, res) {
  try {
    const subscriptionId = req.params.id;
    const payload = {};

    if (req.body.title) {
      payload.title = req.body.title;
    }

    const response = await subscriptionService.update(subscriptionId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the subscription";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update subscription error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /subscription/:id
 * req.body {}
 */

export async function deleteSubscription(req, res) {
  try {
    const response = await subscriptionService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the subscription";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
