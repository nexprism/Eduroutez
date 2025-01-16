import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import StudentService from "../services/student-service.js";
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

/**
 * POST : /student
 * req.body {}
 */
export const createStudent = async (req, res) => {
  try {
    multiUploader(req, res, async function (err) {
      console.log("req.files", req.files);
      if (err) {
        console.error("Error uploading files:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
      }

      const student = req.user
      const payload = { ...req.body };
      console.log("payload", payload);
      if (req.files && req.files["profilePicture"]) {
        payload.profilePicture = req.files["profilePicture"][0].filename;
      }
      if (req.files && req.files["adharCardImage"]) {
        payload.adharCardImage = req.files["adharCardImage"][0].filename;
      }
      if (req.files && req.files["panCardImage"]) {
        payload.panCardImage = req.files["panCardImage"][0].filename;
      }
      if (req.files && req.files["tenthMarksheetImage"]) {
        payload.tenthMarksheetImage = req.files["tenthMarksheetImage"][0].filename;
      }
      if (req.files && req.files["twelthMarksheetImage"]) {
        payload.twelthMarksheetImage = req.files["twelthMarksheetImage"][0].filename;
      }

      // Handle certificateImage files inside the educations array
      if (req.files && req.files["certificateImage"]) {
        const certificateImages = req.files["certificateImage"].map((file) => file.filename);
        if (Array.isArray(payload.educations)) {
          payload.educations = JSON.parse(payload.educations);
          payload.educations = payload.educations.map((education, index) => {
            if (certificateImages[index]) {
              education.certificateImage = certificateImages[index];
            }
            return education;
          });
        }
      }

        payload.user = student._id;
        payload.email = student.email;
      if (req.body.dob) {
         payload.dateOfBirth = new Date(payload.dob);
      }

      try {
        const response = await studentService.create(payload);

        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully created a student";

        return res.status(StatusCodes.CREATED).json(SuccessResponse);
      } catch (error) {
        console.error("Error creating student:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
      }
    });
  } catch (error) {
    console.error("Error in createStudent:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
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
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /student/:id
 * req.body {capacity:200}
 */

export async function updateStudent(req, res) {
  singleUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const studentId = req.params.id;
      const payload = {};
      let oldImagePath;

      // Check if a new title is provided
      if (req.body.title) {
        payload.title = req.body.title;
      }

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

      const user_payload = {};
      if (req.body.email) {
        user_payload.email = req.body.email;
      } 

      if (req.body.name) {
        user_payload.name = req.body.name;
      }

      if (req.body.phone) {
        user_payload.contact_number = req.body.phone;
      }

      const user = await userService.update(studentId, user_payload);

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
