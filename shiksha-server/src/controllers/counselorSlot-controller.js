import { StatusCodes } from "http-status-codes";
import CounselorSlotService from "../services/counselorSlot-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const counselorSlotService = new CounselorSlotService();

/**
 * POST : /question-answer
 * req.body {}
 */
export const createCounselorSlots = async (req, res) => {
  try {
    const payload = req.body;
    const response = await counselorSlotService.create(payload);
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
 * GET : /counselor-slots
 * req.query {}
 */
export const getCounselorSlots = async (req, res) => {
  try {
    const response = await counselorSlotService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched counselor slots";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /counselor-slots/:id
 * req.params {id}
 */
export const getCounselorSlot = async (req, res) => {
  try {
    // console.log(req.params.email);
    const response = await counselorSlotService.get(req.params.email);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the counselor slot";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * PATCH : /counselor-slots/:id
 * req.body {capacity:200}
 */
export const updateCounselorSlot = async (req, res) => {
  try {
    const counselorSlotEmail = req.params.email;
    const payload = {};

    Object.assign(payload, req.body);

    const response = await counselorSlotService.update(payload.counselorEmail, payload);
    console.log(response);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the counselor slot";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update counselor slot error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

/**
 * DELETE : /counselor-slots/:id
 * req.params {id}
 */
export const deleteCounselorSlot = async (req, res) => {
  try {
    const response = await counselorSlotService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the counselor slot";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};
