import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import WebinarService from "../services/webinar-service.js";
import UserService from "../services/user-service.js";
const singleUploader = FileUpload.upload.single("image");
const webinarService = new WebinarService();
const usersevice = new UserService();

/**
 * POST : /webinar
 * req.body {}
 */
export const createWebinar = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      payload.image = req.file.filename;

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

    
    const response = await webinarService.getAllByUser(instituteId);
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
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const webinarId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }
      if (req.body.description) {
        payload.description = req.body.description;
      }

      //webinarLink
      if (req.body.webinarLink) {
        payload.webinarLink = req.body.webinarLink;
      }

      //date
      if (req.body.date) {
        payload.date = req.body.date;
      }

      //time
      if (req.body.time) {
        payload.time = req.body.time;
      }

      //duration
      if (req.body.duration) {
        payload.duration = req.body.duration;
      }


      // Check if a new image is uploaded
      if (req.file) {
        const webinar = await webinarService.getwebinarById(webinarId);

        // Record the old image path if it exists
        if (webinar.image) {
          oldImagePath = path.join("uploads", webinar.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the webinar with new data
      const response = await webinarService.update(webinarId, payload);

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
