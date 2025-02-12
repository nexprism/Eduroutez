import { StatusCodes } from "http-status-codes";
import PayoutService from "../services/payout-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const payoutService = new PayoutService();
import UserService from "../services/users-service.js";
const userService=new UserService();
/**
 * POST : /payout
 * req.body {}
 */
export const createPayout = async (req, res) => {
  try {
    const payload = { ...req.body };

    const user = req.user;

    payload.user = user._id;

    if (user.role === "student") {
      payload.userType = "STUDENT";
    }

    console.log("user", user);

    if (user.role === "counsellor") {
      payload.userType = "COUNSELOR";
    }

    console.log("payload", payload);

    if (user.balance < payload.requestedAmount) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Insufficient balance" });
    }

    

    const response = await payoutService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a payout";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating payout:", error.message);
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /payout
 * req.body {}
 */

export async function getPayouts(req, res) {
  try {
    const response = await payoutService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched payouts";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating payout:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

//getPayoutsByUser
export async function getPayoutsByUser(req, res) {
  try {
    const response = await payoutService.getAllByUser(req.user._id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched payouts";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating payout:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /payout/:id
 * req.body {}
 */

export async function getPayout(req, res) {
  try {
    
    const response = await payoutService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the payout";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error fetching payout:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /payout/:id
 * req.body {capacity:200}
 */

export async function updatePayout(req, res) {
  try {
    const couponId = req.params.id;
    const payload = { ...req.body };

    // Check if a new title is provided
    if (req.body.paymentStatus) {
      payload.paymentStatus = req.body.paymentStatus;
    }

    if (req.body.status){
      payload.status = req.body.status;
    }

    if (req.body.transactionId){
      payload.transactionId = req.body.transactionId;
    }

    console.log("couponId", couponId);
    console.log("payload", payload);

    if (payload.status == 'PAID'){
      const payout = await payoutService.get(couponId);
      console.log("payout", payout);
      const user = await userService.get(payout.user);
      console.log("user", user);
      const newBalance = user.balance - payout.requestedAmount;
      console.log("newBalance", newBalance);
      await userService.update(user._id, {balance: newBalance});
    }

    // Update the payout with new data
    const response = await payoutService.update(couponId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the payout";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update payout error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /payout/:id
 * req.body {}
 */

export async function deletePayout(req, res) {
  try {
    const response = await payoutService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the payout";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error deleting payout:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
