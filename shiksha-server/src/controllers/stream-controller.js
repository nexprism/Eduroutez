import { StatusCodes } from "http-status-codes";
import StreamService from "../services/stream-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const streamService = new StreamService();

/**
 * POST : /stream
 * req.body {}
 */
export const createStream = async (req, res) => {
  try {
    const payload = { ...req.body };

    const response = await streamService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a stream";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error?.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /stream
 * req.body {}
 */

export async function getStreams(req, res) {
  try {
    const response = await streamService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched streams";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /stream/:id
 * req.body {}
 */

export async function getStream(req, res) {
  try {
    const response = await streamService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the stream";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /stream/:id
 * req.body {capacity:200}
 */

export async function updateStream(req, res) {
  try {
    const streamId = req.params.id;
    const payload = {};

    if (req.body.title) {
      payload.title = req.body.title;
    }

    const response = await streamService.update(streamId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the stream";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update stream error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /stream/:id
 * req.body {}
 */

export async function deleteStream(req, res) {
  try {
    const response = await streamService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the stream";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
