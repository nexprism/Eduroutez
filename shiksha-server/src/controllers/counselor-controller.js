import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import CounselorService from "../services/counselor-service.js";
const multiUploader = FileUpload.upload.fields([
  {
    name: "profilePhoto",
    maxCount: 1,
  },
  {
    name: "adharCard",
    maxCount: 1,
  },
  {
    name: "panCard",
    maxCount: 1,
  },
]);
const counselorService = new CounselorService();

/**
 * POST : /counselor
 * req.body {}
 */
export const createCounselor = async (req, res) => {
  try {
    multiUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      //check email exists
      const emailExists = await counselorService.getByEmail(req.body.email);
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }



      const payload = { ...req.body };


      
      // console.log(payload);
      if (req.files["profilePhoto"]) {
        payload.profilePicture = req.files["profilePhoto"][0].filename;
      }

      if (req.files["adharCard"]) {
        payload.adharCard = req.files["adharCard"][0].filename;
      }

      if (req.files["panCard"]) {
        payload.panCard = req.files["panCard"][0].filename;
      }

      const response = await counselorService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a counselor";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /counselor
 * req.body {}
 */

export async function getCounselors(req, res) {
  try {
    const response = await counselorService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched counselors";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /counselor/:id
 * req.body {}
 */

export async function getCounselor(req, res) {
  try {
    const response = await counselorService.get(req.params.email);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the counselor";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /counselor/:id
 * req.body {capacity:200}
 */

export async function updateCounselor(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const counselorId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const counselor = await counselorService.get(counselorId);

        // Record the old image path if it exists
        if (counselor.image) {
          oldImagePath = path.join("uploads", counselor.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the counselor with new data
      const response = await counselorService.update(counselorId, payload);

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
      SuccessResponse.message = "Successfully updated the counselor";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update counselor error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /counselor/:id
 * req.body {}
 */

export async function deleteCounselor(req, res) {
  try {
    const response = await counselorService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the counselor";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}


export const bookSlots = async (req, res) => {
  try {
    const { email, slot, studentEmail,date } = req.body;
    const payload = { slot, studentEmail,date };
    // console.log('cont',payload);
    const response = await counselorService.book(email, payload);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully booked the slot";
    return res.status(200).json(SuccessResponse);
    
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(500).json(ErrorResponse);
  }
};

export const markSlot = async (req, res) => {
  console.log(req.body);
  try {
    const response = await counselorService.mark(req.body);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully booked the slot";
    return res.status(200).json(SuccessResponse);
    
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(500).json(ErrorResponse);
  }
};
