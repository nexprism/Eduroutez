import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import StudentService from "../services/student-service.js";
import UserService from "../services/users-service.js";
const multiUploader = FileUpload.upload.fields([
  {
    name: "adharCardImage",
    maxCount: 1,
  },
  {
    name: "profilePicture",
    maxCount: 1,
  },
  {
    name: "certificateImage",
    maxCount: 10, // Adjust the maxCount as needed
  },
  {
    name: "adharCardImage",
    maxCount: 1,
  },
  {
    name: "panCardImage",
    maxCount: 1,
  },
  {
    name: "tenthMarksheetImage",
    maxCount: 1,
  },
  {
    name: "twelthMarksheetImage",
    maxCount: 1,
  },
]);
const studentService = new StudentService();
const userService = new UserService();

/**
 * POST : /student
 * req.body {}
 */
export const createStudent = async (req, res) => {
  try {
    multiUploader(req, res, async function (err) {
      if (err) {
        console.error("Error uploading files:", err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Something went wrong during file upload. Please try again later." });
      }

      const student = req.user; // Current logged-in user
      const payload = { ...req.body };

      // Log the received files and body for debugging
      console.log("req.files", req.files);
      console.log("education payload", payload);

      // Handle single file uploads
      const singleFileFields = [
        "profilePicture",
        "adharCardImage",
        "panCardImage",
        "tenthMarksheetImage",
        "twelthMarksheetImage",
      ];

      singleFileFields.forEach((field) => {
        if (req.files && req.files[field]) {
          payload[field] = req.files[field][0].filename;
        }
      });

      // Handle certificateImage files for educations array
      if (req.files && req.files["certificateImage"]) {
        const certificateImages = req.files["certificateImage"].map((file) => file.filename);

        // Ensure educations field is parsed and is an array
        if (payload.educations) {
          try {
            payload.educations = JSON.parse(payload.educations);

            if (Array.isArray(payload.educations)) {
              payload.educations = payload.educations.map((education, index) => {
                if (certificateImages[index]) {
                  education.certificateImage = certificateImages[index];
                }
                return education;
              });
            }
          } catch (parseError) {
            console.error("Error parsing educations:", parseError);
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid educations format." });
          }
        }
      }

      // Add user and email to payload
      payload.user = student._id;
      payload.email = student.email;

      // Validate and convert the date of birth (dob)
      if (req.body.dob && !isNaN(Date.parse(req.body.dob))) {
        payload.dateOfBirth = new Date(req.body.dob);
      }

      // Try to create a student in the database
      try {
        const response = await studentService.create(payload);

        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully created a student";

        return res.status(StatusCodes.CREATED).json(SuccessResponse);
      } catch (creationError) {
        console.error("Error creating student:", creationError.message);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Failed to create student. Please try again later." });
      }
    });
  } catch (error) {
    console.error("Error in createStudent:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An unexpected error occurred. Please try again later." });
  }
};


/**
 * GET : /student
 * req.body {}
 */

export async function getStudents(req, res) {
  try {
    const response = await studentService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched students";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /student/:id
 * req.body {}
 */

export async function getStudent(req, res) {
  try {
    const response = await studentService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the student";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get student error:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /student/:id
 * req.body {capacity:200}
 */

export async function updateStudent(req, res) {
  multiUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const studentId = req.params.id;
      const payload = { ...req.body };
      let oldImagePath;

      console.log("freq.body", req.body);

      // Check if a new title is provided
      

      // Check if a new image is uploaded
      if (req.file) {
        const student = await studentService.get(studentId);

        // Record the old image path if it exists
        if (student.image) {
          oldImagePath = path.join("uploads", student.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the student with new data
      const response = await studentService.update(studentId, payload);

      // const user_payload = {};
      // if (req.body.email) {
      //   user_payload.email = req.body.email;
      // } 

      // if (req.body.name) {
      //   user_payload.name = req.body.name;
      // }

      // if (req.body.phone) {
      //   user_payload.contact_number = req.body.phone;
      // }

      // if (req.body.country) {
      //   user_payload.country = req.body.country;
      // }

      // if (req.body.state) {
      //   user_payload.state = req.body.state;
      // }

      // if (req.body.city) {
      //   user_payload.city = req.body.city;
      // }

      
      // console.log("user_payload", user_payload);
      // const user = await userService.update(response.user, user_payload);

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
      SuccessResponse.message = "Successfully updated the student";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update student error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /student/:id
 * req.body {}
 */

export async function deleteStudent(req, res) {
  try {
    const response = await studentService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the student";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
