import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import CourseCategoryService from "../services/course-category-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const singleUploader = FileUpload.upload.single("icon");
const courseCategoryService = new CourseCategoryService();

/**
 * POST : /courseCategory
 * req.body {}
 */
export const createCourseCategory = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      payload.status = req.body.status === "true" ? true : false;
      payload.icon = req.file.filename;
      payload.parentCategory = req.body.parentCategory || null;

      console.log("Payload:", payload);

      const response = await courseCategoryService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a courseCategory";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /courseCategory
 * req.body {}
 */

export async function getCourseCategories(req, res) {
  try {
    const response = await courseCategoryService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched categories";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /courseCategory/:id
 * req.body {}
 */

export async function getCourseCategory(req, res) {
  try {
    const response = await courseCategoryService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the courseCategory";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /courseCategory/:id
 * req.body {capacity:200}
 */

export async function updateCourseCategory(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const courseCategoryId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }
      if (req.body.parentCategory) {
        payload.parentCategory = req.body.parentCategory;
      }
      if (req.body.status) {
        payload.status = req.body.status === "true" ? true : false;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const courseCategory = await courseCategoryService.get(courseCategoryId);

        // Record the old image path if it exists
        if (courseCategory.icon) {
          oldImagePath = path.join("uploads", courseCategory.icon);
        }

        // Set the new image filename in payload
        payload.icon = req.file.filename;
      }

      // Update the courseCategory with new data
      const response = await courseCategoryService.update(courseCategoryId, payload);

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
      SuccessResponse.message = "Successfully updated the courseCategory";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update courseCategory error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /courseCategory/:id
 * req.body {}
 */

export async function deleteCourseCategory(req, res) {
  try {
    const response = await courseCategoryService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the courseCategory";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
