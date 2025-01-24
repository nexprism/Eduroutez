import { StatusCodes } from "http-status-codes";
import QuestionAnswerService from "../services/query-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const questionAnswerService = new QuestionAnswerService();

/**
 * POST : /question-answer
 * req.body {}
 */
export const createQuery = async (req, res) => {
  try {
    const payload = req.body;
    const response = await questionAnswerService.create(payload);
    console.log(response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a question and answer";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating question and answer:", error);
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /question-answer
 * req.body {}
 */

export async function getQueries(req, res) {
  try {
    const response = await questionAnswerService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /question-answer/:id
 * req.body {}
 */

export async function getQuery(req, res) {
  try {
    const response = await questionAnswerService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /question-answer/:id
 * req.body {capacity:200}
 */

export async function updateQuery(req, res) {
  try {
    const questionAnswerId = req.params.id;
    const payload = {};

    if (req.body.status) {
      payload.status = req.body.status;
    }

    const response = await questionAnswerService.update(questionAnswerId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update question and answer error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /question-answer/:id
 * req.body {}
 */

export async function deleteQuery(req, res) {
  try {
    const response = await questionAnswerService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
