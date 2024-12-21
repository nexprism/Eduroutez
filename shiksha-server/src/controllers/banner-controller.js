import { FileUpload } from "../middlewares/index.js";
import BannerService from "../services/banner-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import { StatusCodes } from "http-status-codes";
const singleUploader = FileUpload.upload.single("image");

const bannerService = new BannerService();

/**
 * POST : /banner
 * req.body {}
 */

export const createBanner = async (req, res) => {
  try {
    singleUploader(req, res, async function (err, data) {
      // console.log("api hitted")
      if (err) {
        return res
          .status(500)
          .json({ error: "File upload error", details: err });
      }

      const payload = { ...req.body };
      if (req.files["image"]) {
        payload.image = req.files["image"][0].filename;
      }

      const response = await bannerService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a banner";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /banners
 * req.body {}
 */

export async function getBanners(req, res) {
  try {
    const response = await bannerService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched banners";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error fetching banner :", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /banner/:id
 * req.body {}
 */

export async function getBanner(req, res) {
  try {
    const response = await bannerService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the banner";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /banner/:id
 * req.body {capacity:200}
 */

export async function updateBanner(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "File upload error", details: err });
    }

    try {
      const bannerId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }
      // Check if a new subTitle is provided
      if (req.body.subTitle) {
        payload.subTitle = req.body.subTitle;
      }
      // Check if a new status is provided
      if (req.body.status) {
        payload.status = req.body.status;
      }
      // Check if a new serial is provided
      if (req.body.serial) {
        payload.serial = req.body.serial;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const banner = await bannerService.get(bannerId);

        // Record the old image path if it exists
        if (banner.image) {
          oldImagePath = path.join("uploads", banner.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the blog with new data
      const response = await bannerService.update(bannerId, payload);

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
      SuccessResponse.message = "Successfully updated the banner";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update banner error:", error);
      ErrorResponse.error = error;
      return res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /banner/:id
 * req.body {}
 */

export async function deleteBanner(req, res) {
  try {
    const response = await bannerService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the banner";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
