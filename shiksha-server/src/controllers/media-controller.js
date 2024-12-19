import { StatusCodes } from "http-status-codes";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import { FileUpload } from "../middlewares/index.js";
import MediaService from "../services/media-service.js";
const mediaService = new MediaService();
const multiUploader = FileUpload.upload.fields([
  {
    name: "images",
    maxCount: 10,
  },
  {
    name: "video",
    maxCount: 1,
  },
]);
/**
 * POST : /Media
 * req.body {}
 */
export const createMedia = async (req, res) => {
  try {
    multiUploader(req, res, async function (err) {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
      }
      const payload = { ...req.body };
      if (req.files["images"]) {
        payload.images = req.files["images"].map((file) => file.filename);
      }
      if (req.files["video"]) {
        payload.video = req.files["video"][0].filename;
      }
      const response = await mediaService.create(payload);
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created media";
      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /Media
 * req.body {}
 */

export async function getMedias(req, res) {
  try {
    const response = await mediaService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched blog categories";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /Media/:id
 * req.body {}
 */

export async function getMedia(req, res) {
  try {
    const response = await mediaService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the blog category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /Media/:id
 * req.body {capacity:200}
 */

export async function updateMedia(req, res) {
  try {
    const MediaId = req.params.id;
    const payload = {};

    if (req.body.title) {
      payload.title = req.body.title;
    }

    const response = await mediaService.update(MediaId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the blog category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update Media error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /Media/:id
 * req.body {}
 */

export async function deleteMedia(req, res) {
  try {
    const response = await mediaService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the blog category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
