import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import CourseService from "../services/course-service.js";
import InstituteService from "../services/institute-service.js";
import UserService from "../services/user-service.js";
import randomstring from "randomstring";
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
const bulkUploader = FileUpload.upload.fields([
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
  {
    name: "ogImage",
    maxCount: 1,
  },
]);
const courseService = new CourseService();
const instituteService=new InstituteService();
const userService=new UserService();

/**
 * POST : /course
 * req.body {}
 */
export const createCourse = async (req, res) => {
  // console.log('course_data',{...req.body});
  try {
    multiUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }

      const payload = { ...req.body };
      const {instituteCategory,...rest}=payload;



      if (req.files && req.files["coursePreviewThumbnail"]) {
        payload.coursePreviewThumbnail = req.files["coursePreviewThumbnail"][0].filename;
      }
      if (req.files && req.files["coursePreviewCover"]) {
        payload.coursePreviewCover = req.files["coursePreviewCover"][0].filename;
      }
      if (req.files && req.files["metaImage"]) {
        payload.metaImage = req.files["metaImage"][0].filename;
      }

      if(payload.courseTitle){
        payload.slug = payload.courseTitle.toLowerCase().replace(/ /g, "-") + '-' + randomstring.generate(5);
      }


      console.log('payload',payload);


      //add validation for courseTitle,shortDescription,category,isCourseFree
      
      if(!payload.courseTitle){
        return res.status(400).json({error:"Course Title is required"});
      }

      if(!payload.shortDescription){
        return res.status(400).json({error:"Short Description is required"});
      }

      if(!payload.category){
        return res.status(400).json({error:"Category is required"});
      }

      if(!payload.isCourseFree){
        return res.status(400).json({error:"Course Type is required"});
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

    const user = req.user;
    
    const response = await courseService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched courses";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log('error',error.message);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}





export async function getPopularCourses(req, res) {
  try {
    const response = await courseService.getPopularCourses(req.query);
    console.log('getPopularCourses result count:', response?.length);
    SuccessResponse.data = { result: response };
    SuccessResponse.message = "Successfully fetched popular courses";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log('error',error.message);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

export async function getTrendingCourses(req, res) {
  try {
    const response = await courseService.getTrendingCourses(req.query);
    console.log('getTrendingCourses result count:', response?.length);
    SuccessResponse.data = { result: response };
    SuccessResponse.message = "Successfully fetched trending courses";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log('error',error.message);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /course/:id
 * req.body {}
 */

export async function getCourse(req, res) {
  try {
    const id = req.params.id;
    var field = '_id';
    if (req.query.field) {
      field = req.query.field;
    }
    const response = await courseService.get(id, field);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the course";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}


//getCourseByInstitute

/**
 * POST : /course/bulk-image-upload
 * Uploads a single image and assigns it to multiple selected courses.
 * req.body: { courseIds: string[] | string, metaImage: file }
 */
export async function bulkImageUpload(req, res) {
  bulkUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "File upload error",
        details: err,
      });
    }

    try {
      let courseIds = req.body.courseIds;
      if (typeof courseIds === "string") {
        try {
          courseIds = JSON.parse(courseIds);
        } catch {
          courseIds = courseIds.split(",").filter(Boolean);
        }
      }
      if (!Array.isArray(courseIds) || !courseIds.length) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No course IDs provided",
        });
      }

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No image file provided",
        });
      }

      const imageFields = [
        "coursePreviewThumbnail",
        "coursePreviewCover",
        "metaImage",
        "ogImage",
      ];

      const payload = {};
      const uploadedImages = {};
      for (const field of imageFields) {
        if (req.files && req.files[field]) {
          const filename = req.files[field][0].filename;
          payload[field] = filename;
          uploadedImages[field] = filename;
        }
      }

      let updatedCount = 0;
      const errors = [];

      for (const courseId of courseIds) {
        try {
          await courseService.update(courseId, payload);
          updatedCount++;
        } catch (updateError) {
          errors.push(`Failed to update course ${courseId}: ${updateError.message}`);
        }
      }

      SuccessResponse.data = {
        updatedCount,
        total: courseIds.length,
        uploadedImages,
        errors: errors.length > 0 ? errors : undefined,
      };
      SuccessResponse.message = `Successfully uploaded images to ${updatedCount} of ${courseIds.length} course(s)`;

      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Bulk image upload error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

export async function getCourseByInstitute(req, res) {
  try {
    const response = await courseService.getCourseByInstitute(req.params.id);
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
  multiUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const courseId = req.params.id;
      const payload = { ...req.body };
      let oldImagePaths = {};
      console.log(req.files);
      console.log(req.body);
      const course = await courseService.get(courseId);
      if (req.files && req.files["coursePreviewThumbnail"]) {
        if (course.coursePreviewThumbnail) {
          oldImagePaths.coursePreviewThumbnail = path.join("uploads", course.coursePreviewThumbnail);
        }
        payload.coursePreviewThumbnail = req.files["coursePreviewThumbnail"][0].filename;
      }

      if (req.files && req.files["coursePreviewCover"]) {
        if (course.coursePreviewCover) {
          oldImagePaths.coursePreviewCover = path.join("uploads", course.coursePreviewCover);
        }
        payload.coursePreviewCover = req.files["coursePreviewCover"][0].filename;
      }

      if (req.files && req.files["metaImage"]) {
        if (course.metaImage) {
          oldImagePaths.metaImage = path.join("uploads", course.metaImage);
        }
        payload.metaImage = req.files["metaImage"][0].filename;
      }

      if (req.files && req.files["ogImage"]) {
        if (course.ogImage) {
          oldImagePaths.ogImage = path.join("uploads", course.ogImage);
        }
        payload.ogImage = req.files["ogImage"][0].filename;
      }

      if(payload.courseTitle){
        payload.slug = payload.courseTitle.toLowerCase().replace(/ /g, "-") + '-' + randomstring.generate(5);
      }

      const oldInstituteCategory = course.instituteCategory;

      const response = await courseService.update(courseId, payload);

      const newInstituteCategory = payload.instituteCategory;
      if (newInstituteCategory) {
        if (oldInstituteCategory && oldInstituteCategory.toString() !== newInstituteCategory.toString()) {
          await instituteService.deleteCourse(oldInstituteCategory, courseId);
          await instituteService.addCourses(newInstituteCategory, response);
        } else {
          await instituteService.updateCourses(newInstituteCategory, courseId, response);
        }
      } else if (oldInstituteCategory) {
        await instituteService.updateCourses(oldInstituteCategory, courseId, response);
      }

      //update courses in institute
      

      for (const key in oldImagePaths) {
        try {
          await fs.unlink(oldImagePaths[key]);
        } catch (unlinkError) {
          console.error(`Error deleting old ${key}:`, unlinkError);
        }
      }

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
    const log=await courseService.delete(req.params.id);
    // console.log(log);

    const response = await courseService.delete(req.params.id);
    const resp = await instituteService.deleteCourse(instituteCategory, req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the course";
    return res.status(200).json(SuccessResponse);
  } catch (error) {
    console.log('error',error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}


