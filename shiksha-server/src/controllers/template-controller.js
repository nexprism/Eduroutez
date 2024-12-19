import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import TemplateService from "../services/template-service.js";
const singleUploader = FileUpload.upload.single("image");
const templateService = new TemplateService();

/**
 * POST : /template
 * req.body {}
 */
export const createTemplate = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      payload.image = req.file.filename;

      const response = await templateService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a template";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /template
 * req.body {}
 */

export async function getTemplates(req, res) {
  try {
    const response = await templateService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched templates";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating template:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /template/:id
 * req.body {}
 */

export async function getTemplate(req, res) {
  try {
    const response = await templateService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the template";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /template/:id
 * req.body {capacity:200}
 */

export async function updateTemplate(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const templateId = req.params.id;
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
        const template = await templateService.get(templateId);

        // Record the old image path if it exists
        if (template.image) {
          oldImagePath = path.join("uploads", template.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the template with new data
      const response = await templateService.update(templateId, payload);

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
      SuccessResponse.message = "Successfully updated the template";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update template error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /template/:id
 * req.body {}
 */

export async function deleteTemplate(req, res) {
  try {
    const response = await templateService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the template";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
