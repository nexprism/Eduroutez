import { StatusCodes } from "http-status-codes";
import CareerCategoryService from "../services/career-category-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const careerCategoryService = new CareerCategoryService();

/**
 * POST : /careerCategory
 * req.body {}
 */
export const createCareerCategory = async (req, res) => {
  try {
    const payload = { ...req.body };
    // payload.image = req.file.filename;

    const response = await careerCategoryService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a career category";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log('Error creating career category:', error);
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /careerCategory
 * req.body {}
 */

export async function getCareerCategories(req, res) {
  try {
    const response = await careerCategoryService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched career categories";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /careerCategory/:id
 * req.body {}
 */

export async function getCareerCategory(req, res) {
  try {
    const response = await careerCategoryService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the career category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /careerCategory/:id
 * req.body {capacity:200}
 */

export async function updateCareerCategory(req, res) {
  try {
    const careerCategoryId = req.params.id;
    const payload = {};

    console.log('req.body', req.body);
    if (req.body.name) {
      payload.name = req.body.name;
    }

    const response = await careerCategoryService.update(careerCategoryId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the career category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update careerCategory error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /careerCategory/:id
 * req.body {}
 */

export async function deleteCareerCategory(req, res) {
  try {
    const response = await careerCategoryService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the career category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
