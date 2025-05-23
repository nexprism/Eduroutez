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
        contact_number: req.body.contactno,
        password: req.body.password,
        role: "counsellor",
        is_verified: true,
      };

      const userResponse = await userService.signup(userPayload, res);
      const userId = userResponse.user._id;


        counselorpayload = {
          ...payload,
          _id: userId,
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
    console.log("InstituteId:", instituteId);
    const query = req.query;

    // Add instituteId to the filters in the query
    if (!query.filters) {
      query.filters = JSON.stringify({ instituteId });
    } else {
      const filters = JSON.parse(query.filters);
      filters.instituteId = instituteId;
      query.filters = JSON.stringify(filters);
    }
    // console.log("Query:", query);

    const response = await counselorService.getAll(query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched counselors";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error in getCounselorsByInstitute:", error.message);
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
    console.log("Response:", response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the counselor";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error in getCounselor:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /counselor/:id
 * req.body {capacity:200}
 */

//updateCounselor with images
export const updateCounselor = async (req, res) => {
  try {
    // Wrap multiUploader in a Promise to handle it properly
    await new Promise((resolve, reject) => {
      multiUploader(req, res, (err) => {
        if (err) {
          console.error("Multer upload error:", err);
          reject(err);
        }
        resolve();
      });
    });

    

    const { id } = req.params;
    const payload = { ...req.body };

    // Handle file uploads
    console.log("Files:", payload);
    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        payload.profilePhoto = req.files.profilePhoto[0].path;
      }

      if (req.files.adharCard && req.files.adharCard[0]) {
        payload.adharCard = req.files.adharCard[0].path;
      }

      if (req.files.panCard && req.files.panCard[0]) {
        payload.panCard = req.files.panCard[0].path;
      }
    }

    console.log("update counselor Payload:", payload);

    const response = await counselorService.update(id, payload);
    console.log("Response:", response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the counselor";
    return res.status(StatusCodes.OK).json(SuccessResponse);

  } catch (error) {
    console.error("Error in updateCounselor:", error.message);
    return res.status(error.statusCode || 500).json({ ...ErrorResponse, error });
  }
}

//getCounselorById
export const getCounselorById = async (req, res) => {
    try {
      console.log("Request:", req.params.id);
      const response = await counselorService.getById(req.params.id);
      console.log("Response:", response);
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully fetched the counselor";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      conosoel.error("Error in getCounselor:", error.message);
      ErrorResponse.error = error;
      return res.status(error.statusCode).json(ErrorResponse);
    }
};

//getCounselorsByCategory
export const getCounselorsByCategory = async (req, res) => {
  try {
    const category = req.body.category;
    const response = await counselorService.getByCategory(category);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched counselors";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};

//submitcounsellorslotReview
export const submitcounsellorReview = async (req, res) => {
  try {
    const { email, date, counselorId, studentEmail, rating, comment } = req.body;
    const payload = { date, counselorId, studentEmail, rating, comment };
    const response = await counselorService.submitReview(counselorId, payload);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully submitted the review";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error in submitcounsellorReview:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};


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
    const { counselorId, slot, studentId, date, paymentId } = req.body;
    const payload = { slot, studentId, date, paymentId };
    // console.log('cont',payload);
    const response = await counselorService.book(counselorId, payload);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully booked the slot";
    return res.status(200).json(SuccessResponse);
    
  } catch (error) {
    console.log('error',error.message);
    ErrorResponse.error = error.message;
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

}