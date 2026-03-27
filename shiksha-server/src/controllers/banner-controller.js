import { StatusCodes } from "http-status-codes";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import { FileUpload } from "../middlewares/index.js";
import BannerService from "../services/banner-service.js";

const bannerService = new BannerService();

const multiUploader = FileUpload.upload.fields([
  {
    name: "images",
    maxCount: 10,
  },
  {
    name: "video",
    maxCount: 1,
  },
]);

/**
 * POST : /banner
 */
export const createBanner = async (req, res) => {
  try {
    multiUploader(req, res, async function (err) {
      if (err) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Something went wrong. Please try again later." });
      }


      const payload = { ...req.body };

      if (req.body.destinationLink) {
        payload.destinationLink = req.body.destinationLink;
      }

      if (req.files && req.files["images"]) {
        payload.images = req.files["images"].map((file) => file.filename);
      }
      if (req.files && req.files["video"]) {
        payload.video = req.files["video"][0].filename;
      }

      const response = await bannerService.create(payload);
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created banner";
      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

/**
 * GET : /banners
 */
export async function getBanners(req, res) {
  try {
    const response = await bannerService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched banners";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * GET : /banner/:id
 */
export async function getBanner(req, res) {
  try {
    const response = await bannerService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the banner";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * PATCH : /banner/:id
 */
export async function updateBanner(req, res) {
  try {
    multiUploader(req, res, async function (err) {
      if (err) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Something went wrong. Please try again later." });
      }

      try {
        const bannerId = req.params.id;
        const payload = {};

        if (req.body.title) {
          payload.title = req.body.title;
        }
        if (req.body.work) {
          payload.work = req.body.work;
        }
        if (req.body.destinationLink) {
          payload.destinationLink = req.body.destinationLink;
        }
        if (req.files && req.files["images"]) {
          payload.images = req.files["images"].map((file) => file.filename);
        }
        if (req.files && req.files["video"]) {
          payload.video = req.files["video"][0].filename;
        }

        const response = await bannerService.update(bannerId, payload);

        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully updated the banner";
        return res.status(StatusCodes.OK).json(SuccessResponse);
      } catch (error) {
        ErrorResponse.error = error;
        return res
          .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
          .json(ErrorResponse);
      }
    });
  } catch (error) {
    ErrorResponse.error = error;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

/**
 * DELETE : /banner/:id
 */
export async function deleteBanner(req, res) {
  try {
    const response = await bannerService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the banner";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}
