import { StatusCodes } from "http-status-codes";
import PurchasedWebinarPackageService from "../services/purchased-webinar-package-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";

const purchasedService = new PurchasedWebinarPackageService();

/**
 * POST : /webinar-package/purchase
 * Institute purchases a webinar package
 */
export const purchaseWebinarPackage = async (req, res) => {
  try {
    const user = req.user;
    const payload = req.body;

    const response = await purchasedService.createPurchase(user, payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Webinar package purchased successfully";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * GET : /webinar-purchase/:id
 * Get single purchase details
 */
export const getPurchaseDetails = async (req, res) => {
  try {
    const response = await purchasedService.getPurchase(req.params.id);

    SuccessResponse.data = response;
    SuccessResponse.message = "Purchase details fetched successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * GET : /webinar-purchases
 * Get all purchases (Admin view with filters)
 */
export const getAllPurchases = async (req, res) => {
  try {
    const response = await purchasedService.getAllPurchases(req.query);

    SuccessResponse.data = response;
    SuccessResponse.message = "Purchases fetched successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * GET : /webinar-purchases/institute/:instituteId
 * Get institute's purchases
 */
export const getInstitutePurchases = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const response = await purchasedService.getInstitutePurchases(instituteId, req.query);

    SuccessResponse.data = response;
    SuccessResponse.message = "Institute purchases fetched successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * GET : /my-webinar-purchases
 * Get current institute's purchases
 */
export const getMyPurchases = async (req, res) => {
  try {
    const user = req.user;
    const response = await purchasedService.getInstitutePurchases(user._id, req.query);

    SuccessResponse.data = response;
    SuccessResponse.message = "Your purchases fetched successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * PATCH : /webinar-purchase/:id
 * Update purchase details
 */
export const updatePurchase = async (req, res) => {
  try {
    const response = await purchasedService.updatePurchase(req.params.id, req.body);

    SuccessResponse.data = response;
    SuccessResponse.message = "Purchase updated successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * DELETE : /webinar-purchase/:id
 * Delete purchase (soft delete)
 */
export const deletePurchase = async (req, res) => {
  try {
    const response = await purchasedService.deletePurchase(req.params.id);

    SuccessResponse.data = response;
    SuccessResponse.message = "Purchase deleted successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * POST : /webinar-purchase/:purchaseId/use-webinar
 * Use one webinar from purchased package
 */
export const useWebinar = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { count = 1 } = req.body;

    const response = await purchasedService.useWebinar(purchaseId, parseInt(count));

    SuccessResponse.data = response;
    SuccessResponse.message = `${count} webinar(s) used successfully`;

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * POST : /webinar-purchase/:purchaseId/confirm-payment
 * Confirm payment for purchase
 */
export const confirmPayment = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      ErrorResponse.error = "Transaction ID is required";
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const response = await purchasedService.confirmPayment(purchaseId, transactionId);

    SuccessResponse.data = response;
    SuccessResponse.message = "Payment confirmed successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * GET : /webinar-purchases/stats
 * Get purchase statistics (Admin only)
 */
export const getPurchaseStatistics = async (req, res) => {
  try {
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
    const response = await purchasedService.getPurchaseStats(filters);

    SuccessResponse.data = response;
    SuccessResponse.message = "Purchase statistics fetched successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * POST : /webinar-purchase/check-availability
 * Check if institute can use webinar from package
 */
export const checkWebinarAvailability = async (req, res) => {
  try {
    const { packageId } = req.body;
    const instituteId = req.user._id;

    if (!packageId) {
      ErrorResponse.error = "Package ID is required";
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const canUse = await purchasedService.canUseWebinar(instituteId, packageId);

    SuccessResponse.data = { available: canUse };
    SuccessResponse.message = canUse ? "Webinars available" : "No webinars available";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};
