import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import CustomPageService from "../services/customPage-service.js";
const singleUploader = FileUpload.upload.single("image");

const customPageService = new CustomPageService();

/**
 * POST : /page
 * req.body {}
 */

export const createPage = async (req, res) => {
  try {
    singleUploader(req, res, async function (err) {
      if (err) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: err });
      }
      const payload = { ...req.body };
      console.log("req.body", req.file);
      if (req.file) {
        payload.image = req.file.filename;
      }
      
      console.log("Create page request body:", payload);
      const response = await customPageService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a page";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /pages
 * req.body {}
 */

export async function getPages(req, res) {
  try {
    const response = await customPageService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched pages";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

export async function getPagesByInstitute(req, res) {
  try {
    const response = await customPageService.getAllByInstitute(
      req.params.instituteId
    );
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched pages";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /page/:id
 * req.body {}
 */

export async function getPage(req, res) {
  try {
    const response = await customPageService.get(req.params.id);
    console.log("response", response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the page";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

//getPageByStreamLevel
export async function getPageByStreamLevel(req, res) {
  try {
    const response = await customPageService.getByStreamLevel(
      req.params.stream,
      req.params.level
    );
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the page";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /page/:id
 * req.body {capacity:200}
 */

export async function updatePage(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "File upload error", details: err });
    }

    try {
      const pageId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }
      if (req.body.description) {
        payload.description = req.body.description;
      }
      if (req.body.status) {
        payload.status = req.body.status;
      }
      if (req.body.section) {
        payload.section = req.body.section;
      }

      if (req.body.stream) {
        payload.stream = req.body.stream;
      }

      if(req.body.level){
        payload.level = req.body.level;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const page = await customPageService.get(pageId);

        // Record the old image path if it exists
        if (page.image) {
          oldImagePath = path.join("uploads", page.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the blog with new data
      const response = await customPageService.update(pageId, payload);

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
      SuccessResponse.message = "Successfully updated the page";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update page error:", error);
      ErrorResponse.error = error;
      return res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /page/:id
 * req.body {}
 */

export async function deletePage(req, res) {
  try {
    const response = await customPageService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the page";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
