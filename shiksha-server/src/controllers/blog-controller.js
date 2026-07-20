import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import BlogService from "../services/blog-service.js";
import UserService from "../services/user-service.js";
import randomstring from "randomstring";
const multiUploader = FileUpload.upload.fields([
  {
    name: "images",
    maxCount: 10, // Allow up to 10 images for coverImages array
  },
  {
    name: "thumbnail",
    maxCount: 1,
  }
]);
const blogService = new BlogService();
const usersevice = new UserService();

/**
 * POST : /blog
 * req.body {}
 */

export const createBlog = async (req, res) => {
  try {
    multiUploader(req, res, async function (err) {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
      }
      const payload = { ...req.body };
      if (req.files && req.files["images"]) {
        payload.coverImages = req.files["images"].map((file) => file.filename);
      }

      //thumbnail
      if (req.files && req.files["thumbnail"]) {
        payload.thumbnail = req.files["thumbnail"][0].filename;
      }

      if(payload.title){
        payload.slug = payload.title.toLowerCase().replace(/ /g, "-") + '-' + randomstring.generate(5);
      }

      const response = await blogService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a blog";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /blog
 * req.body {}
 */

export async function getBlogs(req, res) {
  try {
    const response = await blogService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched blogs";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating blog:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

export async function getBlogsByInstitute(req, res) { 
  try {
   
    const user = await usersevice.getUserById(req.params.instituteId);

    console.log("user", user);

    if(user.role !== 'institute'){

      const response = await blogService.getAllBlogs();
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully fetched blogs";
      return res.status(StatusCodes.OK).json(SuccessResponse);

    }else{

    
    
    const response = await blogService.getAllByInstitute(req.params.instituteId);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched blogs";
    return res.status(StatusCodes.OK).json(SuccessResponse);
    }
    

  } catch (error) {
    console.error("Error creating blog:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /blog/:id
 * req.body {}
 */

export async function getBlog(req, res) {
  try {

    const id = req.params.id;
    var field = '_id';
    if (req.query.field) {
      field = req.query.field;
    }


    const response = await blogService.get(id, field);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the blog";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating blog:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /blog/:id
 * req.body {capacity:200}
 */

export async function updateBlog(req, res) {
  multiUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const blogId = req.params.id;
      const payload = {};

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
        payload.slug = req.body.title.toLowerCase().replace(/ /g, "-") + '-' + randomstring.generate(5);
      }
      if (req.body.description) {
        payload.description = req.body.description;
      }

      if(req.body.category){
        payload.category = req.body.category;

      }

      //stream 
      if(req.body.stream){
        payload.stream = req.body.stream;
      }

      if (typeof req.body.isPublished !== 'undefined') {
        payload.isPublished = req.body.isPublished;
      }
      if (typeof req.body.isActive !== 'undefined') {
        payload.isActive = req.body.isActive;
      }

      // Handle coverImages (images array)
      if (req.files && req.files["images"]) {
        const blog = await blogService.get(blogId);

        // Existing images to preserve (sent as JSON string array from frontend)
        let existingImages = [];
        try {
          existingImages = req.body.existingImages
            ? JSON.parse(req.body.existingImages)
            : [];
        } catch (e) {
          existingImages = [];
        }

        // Delete old cover images that are no longer referenced
        if (blog.coverImages && blog.coverImages.length > 0) {
          const imagesToDelete = blog.coverImages.filter(
            (img) => !existingImages.includes(img)
          );
          for (const img of imagesToDelete) {
            const imgPath = path.join("uploads", img);
            try {
              await fs.access(imgPath);
              await fs.unlink(imgPath);
            } catch (unlinkError) {
              if (unlinkError.code !== 'ENOENT') {
                console.error("Error deleting old cover image:", unlinkError);
              }
            }
          }
        }

        // Set new coverImages: existing preserved + newly uploaded
        const newImages = req.files["images"].map((file) => file.filename);
        payload.coverImages = [...existingImages, ...newImages];
      } else if (req.body.existingImages) {
        // No new files, but existing images list was sent (preserve the list)
        try {
          payload.coverImages = JSON.parse(req.body.existingImages);
        } catch (e) {
          payload.coverImages = [];
        }
      }

      //thumbnail
      if (req.files && req.files["thumbnail"]) {
        const blog = await blogService.get(blogId);

        if (blog.thumbnail) {
          const thumbnailPath = path.join("uploads", blog.thumbnail);
          try {
            await fs.access(thumbnailPath);
            await fs.unlink(thumbnailPath);
          } catch (unlinkError) {
            if (unlinkError.code !== 'ENOENT') {
              console.error("Error deleting old thumbnail:", unlinkError);
            }
          }
        }

        payload.thumbnail = req.files["thumbnail"][0].filename;
      }

      // Update the blog with new data
      const response = await blogService.update(blogId, payload);

      // Return success response
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully updated the blog";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update blog error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /blog/:id
 * req.body {}
 */

export async function deleteBlog(req, res) {
  try {
    const response = await blogService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the blog";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
