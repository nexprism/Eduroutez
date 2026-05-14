import { StatusCodes } from "http-status-codes";
import WebinarPackageService from "../services/webinar-package-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";

const webinarPackageService = new WebinarPackageService();

/**
 * POST : /webinar-package
 * Create a new webinar package (Admin only)
 */
export const createWebinarPackage = async (req, res) => {
  try {
    const user = req.user;
    const payload = req.body;

    const response = await webinarPackageService.create(user, payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Webinar package created successfully";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * GET : /webinar-package/:id
 * Get single webinar package
 */
export const getWebinarPackage = async (req, res) => {
  try {
    const response = await webinarPackageService.get(req.params.id);

    SuccessResponse.data = response;
    SuccessResponse.message = "Webinar package fetched successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * GET : /webinar-packages
 * Get all webinar packages with filtering and pagination
 */
export const getWebinarPackages = async (req, res) => {
  try {
    const response = await webinarPackageService.getAll(req.query);

    SuccessResponse.data = response;
    SuccessResponse.message = "Webinar packages fetched successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * GET : /webinar-packages/active
 * Get active webinar packages (available for purchase)
 */
export const getActiveWebinarPackages = async (req, res) => {
  try {
    const response = await webinarPackageService.getActivePackages();

    SuccessResponse.data = response;
    SuccessResponse.message = "Active webinar packages fetched successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * PATCH : /webinar-package/:id
 * Update webinar package (Admin only)
 */
export const updateWebinarPackage = async (req, res) => {
  try {
    const response = await webinarPackageService.update(req.params.id, req.body);

    SuccessResponse.data = response;
    SuccessResponse.message = "Webinar package updated successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

/**
 * DELETE : /webinar-package/:id
 * Delete webinar package (Admin only - soft delete)
 */
export const deleteWebinarPackage = async (req, res) => {
  try {
    const response = await webinarPackageService.delete(req.params.id);

    SuccessResponse.data = response;
    SuccessResponse.message = "Webinar package deleted successfully";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};
