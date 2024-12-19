import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import CouponService from "../services/coupon-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const singleUploader = FileUpload.upload.single("image");
const couponService = new CouponService();

/**
 * POST : /coupon
 * req.body {}
 */
export const createCoupon = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body, createdBy: req.user.id, image: req.file.filename };

      const response = await couponService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a coupon";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /coupon
 * req.body {}
 */

export async function getCoupons(req, res) {
  try {
    const response = await couponService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched coupons";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating coupon:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /coupon/:id
 * req.body {}
 */

export async function getCoupon(req, res) {
  try {
    const response = await couponService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the coupon";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log("error aa gu", error);

    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /coupon/:id
 * req.body {capacity:200}
 */

export async function updateCoupon(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const couponId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }
      if (req.body.discount) {
        payload.discount = req.body.discount;
      }
      if (req.body.description) {
        payload.description = req.body.description;
      }
      if (req.body.expiryDate) {
        payload.expiryDate = req.body.expiryDate;
      }
      if (req.body.category) {
        payload.category = req.body.category;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const coupon = await couponService.get(couponId);

        // Record the old image path if it exists
        if (coupon.image) {
          oldImagePath = path.join("uploads", coupon.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the coupon with new data
      const response = await couponService.update(couponId, payload);

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
      SuccessResponse.message = "Successfully updated the coupon";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update coupon error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /coupon/:id
 * req.body {}
 */

export async function deleteCoupon(req, res) {
  try {
    const response = await couponService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the coupon";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
