import { StatusCodes } from "http-status-codes";
import SubscriptionService from "../services/subscription-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const subscriptionService = new SubscriptionService();

/**
 * POST : /subscription
 * req.body {}
 */
export const createSubscription = async (req, res) => {
  // console.log('hi',req.body);
  const { features, ...rest } = req.body;
  // console.log(features);
  const formattedFeatures = features ? Object.keys(features).map(key => ({
    key: features[key].key,
    value: features[key].value
  })) : [];
  req.body = { ...rest, features: formattedFeatures };
  try {
    const payload = { ...req.body };
    console.log(payload);

    const response = await subscriptionService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a subscription";

    return res.status(200).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(500).json(ErrorResponse);
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
    return res.status(500).json(ErrorResponse);
  }
}

/**
 * PATCH : /subscription/:id
 * req.body {capacity:200}
 */

export async function updateSubscription(req, res) {
  const { features, ...rest } = req.body;
  const formattedFeatures = features ? Object.keys(features).map(key => ({
    key: features[key].key,
    value: features[key].value
  })) : [];
  req.body = { ...rest, features: formattedFeatures };
  
  try {
    const subscriptionId = req.params.id;
    const payload = { ...req.body };
    console.log(payload);

    const response = await subscriptionService.update(subscriptionId, payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the subscription";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
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


//purchasePlan
export async function purchasePlan(req, res) {
  try {

    const user = req.user;
    const plan = req.body.plan;
    // console.log('user',req.user);

    const payload = {
      plan: plan,
      user: user._id,
      paymentId: req.body.paymentId,
      type: req.body.type
    };

   
  

  // console.log('payload',payload);


  const response = await subscriptionService.purchasePlan(payload);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully " + req.body.type +" plan";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log('error',error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}   
