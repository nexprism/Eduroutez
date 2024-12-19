import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import ReviewService from "../services/review-service.js";
const multiUploader = FileUpload.upload.fields([
  {
    name: "studentDocument",
    maxCount: 1,
  },
  {
    name: "studentSelfie",
    maxCount: 1,
  },
]);
const reviewService = new ReviewService();

/**
 * POST : /review
 * req.body {}
 */
export const createReview = async (req, res) => {
  try {
    multiUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      if (req.files["studentDocument"]) {
        payload.studentDocument = req.files["studentDocument"][0].filename;
      }
      if (req.files["studentSelfie"]) {
        payload.studentSelfie = req.files["studentSelfie"][0].filename;
      }

      const response = await reviewService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a review";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /review
 * req.body {}
 */

export async function getReviews(req, res) {
  try {
    const response = await reviewService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched reviews";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /review/:id
 * req.body {}
 */

export async function getReview(req, res) {
  try {
    const response = await reviewService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the review";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /review/:id
 * req.body {capacity:200}
 */

export async function updateReview(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const reviewId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const review = await reviewService.get(reviewId);

        // Record the old image path if it exists
        if (review.image) {
          oldImagePath = path.join("uploads", review.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the review with new data
      const response = await reviewService.update(reviewId, payload);

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
      SuccessResponse.message = "Successfully updated the review";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update review error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /review/:id
 * req.body {}
 */

export async function deleteReview(req, res) {
  try {
    const response = await reviewService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the review";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
