import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import InstituteInquiryService from "../services/institute-inquiry-service.js";
const instituteInquiryService = new InstituteInquiryService();

/**
 * POST : /instituteInquiry
 * req.body {}
 */
export const createInstituteInquiry = async (req, res) => {
  try {
    const response = await instituteInquiryService.create(req.body);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a instituteInquiry";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /instituteInquiry
 * req.body {}
 */

export async function getInstituteInquiries(req, res) {
  try {
    const response = await instituteInquiryService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched instituteInquiries";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating instituteInquiry:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /instituteInquiry/:id
 * req.body {}
 */

export async function getInstituteInquiry(req, res) {
  try {
    const response = await instituteInquiryService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the instituteInquiry";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /instituteInquiry/:id
 * req.body {capacity:200}
 */

export async function updateInstituteInquiry(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const instituteInquiryId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }
      if (req.body.description) {
        payload.description = req.body.description;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const instituteInquiry = await instituteInquiryService.get(instituteInquiryId);

        // Record the old image path if it exists
        if (instituteInquiry.image) {
          oldImagePath = path.join("uploads", instituteInquiry.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the instituteInquiry with new data
      const response = await instituteInquiryService.update(instituteInquiryId, payload);

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
      SuccessResponse.message = "Successfully updated the instituteInquiry";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update instituteInquiry error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /instituteInquiry/:id
 * req.body {}
 */

export async function deleteInstituteInquiry(req, res) {
  try {
    const response = await instituteInquiryService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the instituteInquiry";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
