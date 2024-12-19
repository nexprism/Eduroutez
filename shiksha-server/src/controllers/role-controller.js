import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import RoleService from "../services/role-service.js";
const roleService = new RoleService();

/**
 * POST : /role
 * req.body {}
 */
export const createRole = async (req, res) => {
  try {
    const response = await roleService.create(req.body);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a role";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /role
 * req.body {}
 */

export async function getRoles(req, res) {
  try {
    const response = await roleService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched roles";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error creating role:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /role/:id
 * req.body {}
 */

export async function getRole(req, res) {
  try {
    const response = await roleService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the role";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /role/:id
 * req.body {capacity:200}
 */

export async function updateRole(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const roleId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }
      if (req.body.description) {
        payload.description = req.body.description;
      }

      // Check if a new image is uploaded
      if (req.file) {
        const role = await roleService.get(roleId);

        // Record the old image path if it exists
        if (role.image) {
          oldImagePath = path.join("uploads", role.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the role with new data
      const response = await roleService.update(roleId, payload);

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
      SuccessResponse.message = "Successfully updated the role";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update role error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /role/:id
 * req.body {}
 */

export async function deleteRole(req, res) {
  try {
    const response = await roleService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the role";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
