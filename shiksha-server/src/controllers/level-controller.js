import { StatusCodes } from "http-status-codes";
import LevelService from "../services/level-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const levelService = new LevelService();

/**
 * POST : /level
 * req.body {}
 */
export const createLevel = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.image = req.file.filename;

    const response = await levelService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a level";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /level
 * req.body {}
 */

export async function getLevels(req, res) {
  try {
    const response = await levelService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched levels";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /level/:id
 * req.body {}
 */

export async function getLevel(req, res) {
  try {
    const response = await levelService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the level";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /level/:id
 * req.body {capacity:200}
 */

export async function updateLevel(req, res) {
  try {
    const levelId = req.params.id;
    const payload = {};

    if (req.body.title) {
      payload.title = req.body.title;
    }

    const response = await levelService.update(levelId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the level";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update level error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /level/:id
 * req.body {}
 */

export async function deleteLevel(req, res) {
  try {
    const response = await levelService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the level";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
