import { StatusCodes } from "http-status-codes";
import EmailService from "../services/email-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const emailService = new EmailService();


/**
 * POST : /question-answer
 * req.body {}
 */
export const createEmail = async (req, res) => {
  try {
    const payload = req.body;
    const response = await emailService.create(payload);
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

export async function getEmails(req, res) {
  try {
    const response = await emailService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched Email Templates";
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

export async function getEmail(req, res) {
  try {
    const response = await emailService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the Email Template";
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

export async function updateEmail(req, res) {
  try {
    const emailId = req.params.id;

    const payload = req.body;
    // console.log(emailId, payload);

    const response = await emailService.update(emailId, payload);

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

export async function deleteEmail(req, res) {
  try {
    const response = await emailService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the question and answer";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}




