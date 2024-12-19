import { StatusCodes } from "http-status-codes";
import PayoutService from "../services/payout-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const payoutService = new PayoutService();

/**
 * POST : /payout
 * req.body {}
 */
export const createPayout = async (req, res) => {
  try {
    const payload = { ...req.body };

    const response = await payoutService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a payout";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
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
    const payload = {};

    // Check if a new title is provided
    if (req.body.title) {
      payload.title = req.body.title;
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
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
