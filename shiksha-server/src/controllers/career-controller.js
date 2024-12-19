import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import CareerService from "../services/career-service.js";
const singleUploader = FileUpload.upload.single("image");
const careerService = new CareerService();

/**
 * POST : /career
 * req.body {}
 */
export const createCareer = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      payload.careerPreviewThumbnail = req.files["career-preview-thumbnail"][0].filename;
      payload.careerPreviewCover = req.files["career-preview-cover"][0].filename;
      payload.metaImage = req.files["meta-image"][0].filename;

      const response = await careerService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a career";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /career
 * req.body {}
 */

export async function getCareers(req, res) {
  try {
    const response = await careerService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched careers";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /career/:id
 * req.body {}
 */

export async function getCareer(req, res) {
  try {
    const response = await careerService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the career";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /career/:id
 * req.body {capacity:200}
 */

export async function updateCareer(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const careerId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const career = await careerService.get(careerId);

        // Record the old image path if it exists
        if (career.image) {
          oldImagePath = path.join("uploads", career.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the career with new data
      const response = await careerService.update(careerId, payload);

      // Delete the old image only if the update is successful and old image exists
      if (oldImagePath) {
        try {
          fs.unlink(oldImagePath);
        } catch (unlinkError) {
          console.error("Error deleting old image:", unlinkError);
        }
      }

      // Return success response
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully updated the career";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update career error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /career/:id
 * req.body {}
 */

export async function deleteCareer(req, res) {
  try {
    const response = await careerService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the career";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
