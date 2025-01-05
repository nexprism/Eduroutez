import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import CourseService from "../services/course-service.js";
import InstituteService from "../services/institute-service.js";
const multiUploader = FileUpload.upload.fields([
  {
    name: "coursePreviewThumbnail",
    maxCount: 1,
  },
  {
    name: "coursePreviewCover",
    maxCount: 1,
  },
  {
    name: "metaImage",
    maxCount: 1,
  },
]);
const courseService = new CourseService();
const instituteService=new InstituteService();

/**
 * POST : /course
 * req.body {}
 */
export const createCourse = async (req, res) => {
  console.log(req.body);
  try {
    multiUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      const {instituteCategory,...rest}=payload;

      if (req.files["coursePreviewThumbnail"]) {
        payload.coursePreviewThumbnail = req.files["coursePreviewThumbnail"][0].filename;
      }
      if (req.files["coursePreviewCover"]) {
        payload.coursePreviewCover = req.files["coursePreviewCover"][0].filename;
      }
      if (req.files["metaImage"]) {
        payload.metaImage = req.files["metaImage"][0].filename;
      }
      
      const response = await courseService.create(payload);
      const resp=await instituteService.addCourses(instituteCategory,response);
      // console.log('good')
      // console.log(response)
      // console.log('good2');
      // console.log(resp)

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a course";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
};

/**
 * GET : /course
 * req.body {}
 */

export async function getCourses(req, res) {
  try {
    const response = await courseService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched courses";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}



export async function getPopularCourses(req, res) {
  try {
    const response = await courseService.getPopularCourses();
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched popular courses";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /course/:id
 * req.body {}
 */

export async function getCourse(req, res) {
  try {
    // console.log(req.params.id);
    const response = await courseService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the course";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /course/:id
 * req.body {capacity:200}
 */

export async function updateCourse(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const courseId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const course = await courseService.get(courseId);

        // Record the old image path if it exists
        if (course.image) {
          oldImagePath = path.join("uploads", course.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the course with new data
      const response = await courseService.update(courseId, payload);

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
      SuccessResponse.message = "Successfully updated the course";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update course error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /course/:id
 * req.body {}
 */

export async function deleteCourse(req, res) {
  try {
    const course = await courseService.get(req.params.id);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const { instituteCategory } = course;
    // console.log(course);
    // console.log(instituteCategory);
    // console.log('bro');


    // Remove the course from the associated institute
    const log=await instituteService.deleteCourse(instituteCategory,req.params.id);
    // console.log(log);

    const response = await courseService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the course";
    return res.status(200).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}


