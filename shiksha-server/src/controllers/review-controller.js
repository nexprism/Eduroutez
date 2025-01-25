import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import ReviewService from "../services/review-service.js";
import InstituteService from "../services/institute-service.js";
const multiUploader = FileUpload.upload.fields([
  {
    name: "studentIdImage",
    maxCount: 1,
  },
  {
    name: "selfieImage",
    maxCount: 1,
  },
]);
const reviewService = new ReviewService();
const instituteService = new InstituteService();

/**
 * POST : /review
 * req.body {}
 */
export const createReview = async (req, res) => {
  // console.log(req?.files);
  try {
    multiUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      const {institute,...rest}=payload;
      if (req?.files["studentIdImage"]) {
        payload.studentIdImage = req.files["studentIdImage"][0].filename;
      }
      if (req?.files["selfieImage"]) {
        payload.selfieImage = req.files["selfieImage"][0].filename;
      }

      console.log('payload',payload);
      const response = await reviewService.create(payload);
      console.log(response);
      const resp=await instituteService.addReviews(institute,response);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a review";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    console.log('error in create review',error.message);
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
    // console.log('hi2');
    const response = await reviewService.getall();
    // console.log(response);y
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

//updateReview with images
export const updateReview = async (req, res) => {
  try {
    multiUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      if (req?.files["studentIdImage"]) {
        payload.studentIdImage = req.files["studentIdImage"][0].filename;
      }
      if (req?.files["selfieImage"]) {
        payload.selfieImage = req.files["selfieImage"][0].filename;
      }

      const response = await reviewService.update(req.params.id, payload);
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully updated the review";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    });
  } catch (error) {
    console.log('error in update review',error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
};



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

//getReviewByInstitute
export async function getReviewByInstitute(req, res) {
  try {
    const response = await reviewService.getReviewsByInstitute(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched reviews";
    return res.status(200).json(SuccessResponse);
  } catch (error) {
    console.log('err',error.message)
    ErrorResponse.error = error;
    return res.status(500).json(ErrorResponse);
  } 
}




export async function getReviewsByUser(req, res) {  
  try {
    const response = await reviewService.getReviewsByUser(req.params.email);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched reviews";
    return res.status(200).json(SuccessResponse);
  } catch (error) {
    console.log('err',error.message)
    ErrorResponse.error = error;
    return res.status(500).json(ErrorResponse);
  } 
}