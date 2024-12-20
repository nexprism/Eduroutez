import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import InstituteService from "../services/institute-service.js";
const singleUploader = FileUpload.upload.single("image");
const multiUploader = FileUpload.upload.fields([
  {
    name: "instituteLogo",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1,
  },
  {
    name: "thumbnailImage",
    maxCount: 1,
  },
  {
    name: "brochure",
    maxCount: 1,
  },
  {
    name: "gallery",
    maxCount: 10,
  },
]);
const instituteService = new InstituteService();

/**
 * POST : /institute
 * req.body {}
 */
export const createInstitute = async (req, res) => {
  try {
    // multiUploader(req, res, async function (err, data) {
    //   if (err) {
    //     return res.status(500).json({ error: err });
    //   }

    const payload = { ...req.body };

    // if (req.files["instituteLogo"]) {
    //   payload.instituteLogo = req.files["instituteLogo"][0].filename;
    // }
    // if (req.files["coverImage"]) {
    //   payload.coverImage = req.files["coverImage"][0].filename;
    // }
    // if (req.files["thumbnailImage"]) {
    //   payload.thumbnailImage = req.files["thumbnailImage"][0].filename;
    // }
    // if (req.files["brochure"]) {
    //   payload.brochure = req.files["brochure"][0].filename;
    // }
    // if (req.files["gallery"]) {
    //   payload.gallery = req.files["gallery"].map((file) => file.filename);
    // }

    const response = await instituteService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created an institute";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
    // });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
};

/**
 * GET : /institute
 * req.body {}
 */

export async function getInstitutes(req, res) {
  try {
    const response = await instituteService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched institutes";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get institutes error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /institute/:id
 * req.body {}
 */

export async function getInstitute(req, res) {
  try {
    const response = await instituteService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the institute";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /institute/:id
 * req.body {capacity:200}
 */

export async function updateInstitute(req, res) {
  multiUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const instituteId = req.params.id;
      const payload = req.body;
      let oldImagePath;
      console.log(req.files);
      // console.log(req.file);
      // Check if a new title is provided
      // if (req.body.title) {
      //   payload.title = req.body.title;
      // }

      // console.log('hi')
      // Check if a new image is uploaded
      if (req.file) {
        const institute = await instituteService.get(instituteId);

        console.log(institute);
        // Record the old image path if it exists
        if (institute.image) {
          oldImagePath = path.join("uploads", institute.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the institute with new data
      // console.log(payload);
      const response = await instituteService.update(instituteId, payload);
      // console.log(response);

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
      SuccessResponse.message = "Successfully updated the institute";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update institute error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /institute/:id
 * req.body {}
 */

export async function deleteInstitute(req, res) {
  try {
    const response = await instituteService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the institute";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
