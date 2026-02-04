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
    SuccessResponse.message = "Successfully created a query";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating query:", error);
    ErrorResponse.error = error;

    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
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
    SuccessResponse.message = "Successfully fetched queries";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
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
    SuccessResponse.message = "Successfully fetched the query";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error in getQuery", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

//QueryAllocation
export async function QueryAllocation(req, res) {
  try {
    const response = await questionAnswerService.QueryAllocation(req.body);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully allocated query";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log("Error in QueryAllocation", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


//getQueryByInstitute
export async function getQueryByInstitute(req, res) {
  try {
    console.log("req.params.id", req.params.id);
    const response = await questionAnswerService.getByInstitute(req.params.id,req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched queries by institute";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log("Error in getQueryByInstitute", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
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
    SuccessResponse.message = "Successfully deleted the query";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}
