import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import CounselorService from "../services/counselor-service.js";
import UserService from "../services/user-service.js";
const singleUploader = FileUpload.upload.single("image");
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
const userService = new UserService();

/**
 * POST : /counselor
 * req.body {}
 */
export const createCounselor = async (req, res) => {
  try {
    console.log('Incoming data:', req.body); // Debugging

    const emailExists = await userService.getUserByEmail(req.body.email);
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const payload = { ...req.body };
    let counselorpayload = { ...payload };

    if (req.body.password) {
        const emailExists = await userService.getUserByEmail(req.body.email);
        if (emailExists) {
          return res.status(400).json({ error: "Email already exists" });
        }
      const userPayload = {
        name: `${req.body.firstname} ${req.body.lastname}`,
        email: req.body.email,
        password: req.body.password,
        role: "counsellor",
        is_verified: true,
      };

      const userResponse = await userService.signup(userPayload, res);
      const userId = userResponse.user._id;


        counselorpayload = {
          ...payload,
          userId: userId,
        };

      }


      // counselorpayload = {
      //   ...payload,
      //   userId: userId,
      // };

      
      const response = await counselorService.create(counselorpayload);
      //if password get from body then add it payload and save in user model

      // const user = await counselorService.make(req.body.email, payload);


    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a counselor";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log(error.message);

    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
};


/**
 * GET : /counselor
 * req.body {}
 */


//getCouselorsByInstitute
export const getCounselorsByInstitute = async (req, res) => { 
  try {
    const instituteId = req.params.institute;
    const response = await counselorService.getCounselorsByInstitute(instituteId);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched counselors";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  } 
};



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
  multiUploader(req, res, async (err) => {
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

    // Check and set uploaded files
    if (req.files) {
      if (req.files.profilePhoto) {
        payload.profilePhoto = req.files.profilePhoto[0].filename;
      }
      if (req.files.adharCard) {
        payload.adharCard = req.files.adharCard[0].filename;
      }
      if (req.files.panCard) {
        payload.panCard = req.files.panCard[0].filename;
      }
    }

    const response = await counselorService.update(counselorId, payload);

    // Return success response
    return res.status(StatusCodes.OK).json({
      message: "Successfully updated the counselor",
      data: response,
    });

  } catch (error) {
    console.error("Update counselor error:", error);
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: error.message,
    });
  }
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
