import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import CareerService from "../services/career-service.js";
const singleUploader = FileUpload.upload.single("images");


const multiUploader = FileUpload.upload.fields([
  {
    name: "images",
    maxCount: 1,
  },
  {
    name: "thumbnail",
    maxCount: 1,
  }
]);
const careerService = new CareerService();

/**
 * POST : /career
 * req.body {}
 */
export const createCareer = async (req, res) => {
  try {
    multiUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      if (req.files && req.files["images"]) {
        payload.image = req.files["images"][0].filename;
      }

      //thumbnail
      if (req.files && req.files["thumbnail"]) {
        payload.thumbnail = req.files["thumbnail"][0].filename;
      }

      if(payload.title){
        payload.slug = payload.title.toLowerCase().replace(/ /g, "-");
      }

      const response = await careerService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a career";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};



export const getCareerByinstituteId = async (req, res) => {
  try {
    const response = await careerService.getCareerByinstituteId(req.params.instituteId);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched careers";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /career
 * req.body {}
 */

export async function getCareers(req, res) {
  try {
    const response = await careerService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched careers";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /career/:id
 * req.body {}
 */

export async function getCareer(req, res) {
  try {
    const id = req.params.id;
    var field = '_id';
    if (req.query.field) {
      field = req.query.field;
    }
    const response = await careerService.get(id, field);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the career";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log('neew error',error.message);  
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /career/:id
 * req.body {capacity:200}
 */

export async function updateCareer(req, res) {
  console.log("Incoming data:", req.body);
  multiUploader(req, res, async (err) => {
    try {
    if (err) {
      console.error("File upload error:", err.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }


      const careerId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
        payload.slug = req.body.title.toLowerCase().replace(/ /g, "-");
      }

      console.log("files:", req.files);
      console.log("file:", req.file);
      // Check if a new image is uploaded
      if (req.files) {
        const career = await careerService.get(careerId);

        // Record the old image path if it exists
        // if (career.image) {
        //   oldImagePath = path.join("uploads", career.image);
        // }

        // //thumbnail
        // if (career.thumbnail) {
        //   oldImagePath = path.join("uploads", career.thumbnail);
        // }
        

        // Set the new image filename in payload
        //image
        if (req.files && req.files["images"]) {
          payload.image = req.files["images"][0].filename;
        }

        console.log("files thumb:", req.files);
        //thumbnail
        if (req.files && req.files["thumbnail"]) {
          payload.thumbnail = req.files["thumbnail"][0].filename;
        }
      }

      if(req.body.description) {
        payload.description = req.body.description;
      }

      if(req.body.category) {
        payload.category = req.body.category;
      }

      if(req.body.eligibility) {
        payload.eligibility = req.body.eligibility;
      }

      if(req.body.jobRoles) {
        payload.jobRoles = req.body.jobRoles;
      }

      if(req.body.opportunity) {
        payload.opportunity = req.body.opportunity;
      }


      if(req.body.topColleges) {
        payload.topColleges = req.body.topColleges;
      }

      if(req.body.instituteId) {
        payload.instituteId = req.body.instituteId;
      }

      console.log("Payload:", payload);

      const response = await careerService.update(careerId, payload);

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
      SuccessResponse.message = "Successfully updated the career";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update career error:", error.message);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /career/:id
 * req.body {}
 */

export async function deleteCareer(req, res) {
  try {
    const response = await careerService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the career";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
