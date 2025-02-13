import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import BlogService from "../services/blog-service.js";
import UserService from "../services/user-service.js";
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
        payload.image = req.files["images"][0].filename;
      }

      //thumbnail
      if (req.files && req.files["thumbnail"]) {
        payload.thumbnail = req.files["thumbnail"][0].filename;
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
    const response = await blogService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the blog";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
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
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
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

      // Check if a new image is uploaded
      console.log("req.file", req.file);
      if (req.files && req.files["images"]) {
        const blog = await blogService.get(blogId);

        // Record the old image path if it exists
        if (blog.image) {
          oldImagePath = path.join("uploads", blog.image);
        }

      console.log("oldImagePath", oldImagePath);
        // Set the new image filename in payload
        payload.image = req.files["images"][0].filename;
      }

      //thumbnail
      if (req.files && req.files["thumbnail"]) {
        const blog = await blogService.get(blogId);
        
        // Record the old image path if it exists
        if (blog.thumbnail) {
          oldImagePath = path.join("uploads", blog.thumbnail);
        }


        // Set the new image filename in payload
        payload.thumbnail = req.files["thumbnail"][0].filename;
      }

      

        console.log('category payload', payload);


      // Update the blog with new data
      const response = await blogService.update(blogId, payload);

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
