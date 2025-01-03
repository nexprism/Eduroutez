import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import UserService from "../services/users-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const singleUploader = FileUpload.upload.single("image");
const userService = new UserService();

/**
 * GET : /user
 * req.body {}
 */

export async function getUsers(req, res) {
  try {
    const response = await userService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched users";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /user/:id
 * req.body {}
 */

export async function getUser(req, res) {
  try {
    const response = await userService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the user";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /user/:id
 * req.body {capacity:200}
 */

export async function updateUser(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
       const userId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check and update the fields
      if (req.body.name) {
        payload.name = req.body.name;
      }
      if (req.body.contact_number) {
        payload.contact_number = req.body.contact_number;
      }
      if (req.body.address) {
        payload.address = req.body.address;
      }
      if (req.body.city) {
        payload.city = req.body.city;
      }
      if (req.body.state) {
        payload.state = req.body.state;
      }
      if (req.body.country) {
        payload.country = req.body.country;
      }
      if (req.body.date_of_birth) {
        payload.date_of_birth = new Date(req.body.date_of_birth); // Assuming date is passed in 'YYYY-MM-DD' format
      }
      if (req.body.gender) {
        payload.gender = req.body.gender;
      }
      if (req.body.designation) {
        payload.designation = req.body.designation;
      }
      if (req.body.about) {
        payload.about = req.body.about;
      }
      if (req.body.role) {
        payload.role = req.body.role;
      }
      if (req.body.access) {
        payload.access = req.body.access; 
      }

      if (req.file) {
        const user = await userService.get(userId);

        // Record the old image path if it exists
        if (user.image) {
          oldImagePath = path.join("uploads", user.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the user with new data
      const response = await userService.update(userId, payload);

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
      SuccessResponse.message = "Successfully updated the user";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update user error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

export async function allowUser(req, res) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const payload = await userService.get(id);

    if (!payload) {
      return res.status(404).json({ message: 'User not found' });
    }
    payload.is_verified = true;
    const response = await userService.update(id, payload);

    return res.status(200).json({ message: 'User verified successfully', data: response });
  } catch (error) {
    console.error('Error in allowUser:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


/**
 * DELETE : /user/:id
 * req.body {}
 */

export async function deleteUser(req, res) {
  try {
    const response = await userService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the user";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
