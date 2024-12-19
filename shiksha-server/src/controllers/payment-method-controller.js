import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import PaymentMethodService from "../services/payment-method-service.js";
const singleUploader = FileUpload.upload.single("image");
const paymentMethodService = new PaymentMethodService();

/**
 * POST : /payment-method
 * req.body {}
 */
export const createPaymentMethod = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      payload.paymentMethodPreviewThumbnail = req.files["paymentMethod-preview-thumbnail"][0].filename;
      payload.paymentMethodPreviewCover = req.files["paymentMethod-preview-cover"][0].filename;
      payload.metaImage = req.files["meta-image"][0].filename;

      const response = await paymentMethodService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a payment method";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /payment-method
 * req.body {}
 */

export async function getPaymentMethods(req, res) {
  try {
    const response = await paymentMethodService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched payment methods";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /payment-method/:id
 * req.body {}
 */

export async function getPaymentMethod(req, res) {
  try {
    const response = await paymentMethodService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the payment method";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /payment-method/:id
 * req.body {capacity:200}
 */

export async function updatePaymentMethod(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const paymentMethodId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const paymentMethod = await paymentMethodService.get(paymentMethodId);

        // Record the old image path if it exists
        if (paymentMethod.image) {
          oldImagePath = path.join("uploads", paymentMethod.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the paymentMethod with new data
      const response = await paymentMethodService.update(paymentMethodId, payload);

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
      SuccessResponse.message = "Successfully updated the payment method";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update paymentMethod error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /payment-method/:id
 * req.body {}
 */

export async function deletePaymentMethod(req, res) {
  try {
    const response = await paymentMethodService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the payment method";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
