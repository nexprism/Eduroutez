import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import WebinarService from "../services/webinar-service.js";
import UserService from "../services/user-service.js";
const webinarUploader = FileUpload.upload.fields([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "metaImage",
    maxCount: 1,
  }
]);
const webinarService = new WebinarService();
const usersevice = new UserService();

/**
 * POST : /webinar
 * req.body {}
 */
export const createWebinar = async (req, res) => {
  try {
    webinarUploader(req, res, async function (err) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      if (req.files && req.files["image"]) {
        payload.image = req.files["image"][0].filename;
      }
      if (req.files && req.files["metaImage"]) {
        payload.metaImage = req.files["metaImage"][0].filename;
      }

      const response = await webinarService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a webinar";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /webinar
 * req.body {}
 */

export async function getWebinars(req, res) {
  try {
    const response = await webinarService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched webinars";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating webinar:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}


export async function getWebinarsByInstitute(req, res) {
  try {
    const { instituteId } = req.params;

    const user = await usersevice.getUserById(instituteId);
    console.log("user", user.role);
    if (user.role !== "institute") {
      const response = await webinarService.getAllWebinar();
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully fetched webinars";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    }else{

    
      const query = req.query;
      if (!query.filters) {
        query.filters = JSON.stringify({ webinarCreatedBy: instituteId });
      } else {
        const filters = JSON.parse(query.filters);
        filters.webinarCreatedBy = instituteId;
        query.filters = JSON.stringify(filters);
      }
      const response = await webinarService.getAll(query);
      
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched webinars";
    return res.status(StatusCodes.OK).json(SuccessResponse);
    }
  } catch (error) {
    console.error("Error fetching webinar:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /webinar/:id
 * req.body {}
 */

export async function getWebinar(req, res) {
  try {
    console.log("req.params.id", req.params.id);
    const response = await webinarService.getwebinarById(req.params.id);
    console.log("response", response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the webinar";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log("error in getWebinar", error.message);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /webinar/:id
 * req.body {capacity:200}
 */

export async function updateWebinar(req, res) {
  webinarUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const webinarId = req.params.id;
      const payload = {};
      let oldImagePaths = [];

      if (req.body.title) {
        payload.title = req.body.title;
      }
      if (req.body.description) {
        payload.description = req.body.description;
      }

      if (req.body.webinarLink) {
        payload.webinarLink = req.body.webinarLink;
      }

      if (req.body.date) {
        payload.date = req.body.date;
      }

      if (req.body.time) {
        payload.time = req.body.time;
      }

      if (req.body.duration) {
        payload.duration = req.body.duration;
      }

      if (typeof req.body.status !== 'undefined') {
        payload.status = req.body.status;
      }

      if (req.body.metaTitle) {
        payload.metaTitle = req.body.metaTitle;
      }
      if (req.body.metaDescription) {
        payload.metaDescription = req.body.metaDescription;
      }
      if (req.body.metaKeywords) {
        payload.metaKeywords = req.body.metaKeywords;
      }

      if (req.files && req.files["image"]) {
        const webinar = await webinarService.getwebinarById(webinarId);
        if (webinar.image) {
          oldImagePaths.push(path.join("uploads", webinar.image));
        }
        payload.image = req.files["image"][0].filename;
      }

      if (req.files && req.files["metaImage"]) {
        const webinar = await webinarService.getwebinarById(webinarId);
        if (webinar.metaImage) {
          oldImagePaths.push(path.join("uploads", webinar.metaImage));
        }
        payload.metaImage = req.files["metaImage"][0].filename;
      }

      const response = await webinarService.update(webinarId, payload);

      for (const oldPath of oldImagePaths) {
        try {
          await fs.unlink(oldPath);
        } catch (unlinkError) {
          console.error("Error deleting old file:", unlinkError);
        }
      }

      // Return success response
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully updated the webinar";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update webinar error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /webinar/:id
 * req.body {}
 */

export async function deleteWebinar(req, res) {
  try {
    const response = await webinarService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the webinar";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

//getMonthlyWebinarCount
export async function getMonthlyWebinarCount(req, res) {
  try {
    const user = await usersevice.getUserById(req.params.id);
    const response = await webinarService.getMonthlyWebinarCount(user);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the webinar count";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
