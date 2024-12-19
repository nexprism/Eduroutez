import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import CategoryService from "../services/course-category-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const singleUploader = FileUpload.upload.single("image");
const categoryService = new CategoryService();

/**
 * POST : /category
 * req.body {}
 */
export const createCategory = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      payload.image = req.file.filename;

      const response = await categoryService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a category";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /category
 * req.body {}
 */

export async function getCategories(req, res) {
  try {
    const response = await categoryService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched categories";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /category/:id
 * req.body {}
 */

export async function getCategory(req, res) {
  try {
    const response = await categoryService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /category/:id
 * req.body {capacity:200}
 */

export async function updateCategory(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const categoryId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const category = await categoryService.get(categoryId);

        // Record the old image path if it exists
        if (category.image) {
          oldImagePath = path.join("uploads", category.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the category with new data
      const response = await categoryService.update(categoryId, payload);

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
      SuccessResponse.message = "Successfully updated the category";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update category error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /category/:id
 * req.body {}
 */

export async function deleteCategory(req, res) {
  try {
    const response = await categoryService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
