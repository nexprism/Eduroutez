import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import PromotionService from "../services/promotion-service.js";
const singleUploader = FileUpload.upload.single("image");
const promotionService = new PromotionService();

/**
 * POST : /promotion
 * req.body {}
 */
export const createPromotion = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const  user = req.user;

      console.log("User", user);

      console.log(req.body);
      const payload = { ...req.body };
      console.log("file", req.file);
      console.log("files", req.files);

        if(req.file){ 
          //image
          if(req.file){
            payload.image = req.file.filename;
          }

          
        }

      const response = await promotionService.create(user,payload);


      
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a promotion";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /promotion
 * req.body {}
 */

export async function getPromotions(req, res) {
  try {
    const response = await promotionService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched promotions";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating promotion:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /promotion/:id
 * req.body {}
 */

export async function getPromotion(req, res) {
  try {
    const response = await promotionService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the promotion";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /promotion/:id
 * req.body {capacity:200}
 */

export async function updatePromotion(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const promotionId = req.params.id;
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
        const promotion = await promotionService.get(promotionId);

        // Record the old image path if it exists
        if (promotion.image) {
          oldImagePath = path.join("uploads", promotion.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the promotion with new data
      const response = await promotionService.update(promotionId, payload);

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
      SuccessResponse.message = "Successfully updated the promotion";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update promotion error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /promotion/:id
 * req.body {}
 */

export async function deletePromotion(req, res) {
  try {
    const response = await promotionService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the promotion";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
