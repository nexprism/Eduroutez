import { StatusCodes } from "http-status-codes";
import BlogCategoryService from "../services/blog-category-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const blogCategoryService = new BlogCategoryService();

/**
 * POST : /blogCategory
 * req.body {}
 */
export const createBlogCategory = async (req, res) => {
  try {
    const payload = { ...req.body };
    // payload.image = req.file.filename;

    const response = await blogCategoryService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a blog category";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log('Error creating blog category:', error);
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /blogCategory
 * req.body {}
 */

export async function getBlogCategories(req, res) {
  try {
    const response = await blogCategoryService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched blog categories";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /blogCategory/:id
 * req.body {}
 */

export async function getBlogCategory(req, res) {
  try {
    const response = await blogCategoryService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the blog category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /blogCategory/:id
 * req.body {capacity:200}
 */

export async function updateBlogCategory(req, res) {
  try {
    const blogCategoryId = req.params.id;
    const payload = {};

    console.log('req.body', req.body);
    if (req.body.name) {
      payload.name = req.body.name;
    }

    const response = await blogCategoryService.update(blogCategoryId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the blog category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update blogCategory error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /blogCategory/:id
 * req.body {}
 */

export async function deleteBlogCategory(req, res) {
  try {
    const response = await blogCategoryService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the blog category";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
