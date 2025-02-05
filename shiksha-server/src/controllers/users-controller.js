import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import UserService from "../services/users-service.js";
import InstituteService from "../services/institute-service.js";
import StudentService from "../services/student-service.js";
import CounselorService from "../services/counselor-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const singleUploader = FileUpload.upload.single("image");
const userService = new UserService();
const instituteService = new InstituteService();
const counselorService = new CounselorService();
const studentService = new StudentService();

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



export async function getcounselers(req, res) { 
  try {
    const response = await userService.getcounselers(req.query);
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

      const user = await studentService.get(userId);
      if (req.file) {

        
        // Record the old image path if it exists
        if (user.image) {
          oldImagePath = path.join("uploads", user.image);
        }

        // Set the new image filename in payload
        payload.image = req.file.filename;
      }

      // Update the user with new data

      
      const student = await studentService.get(userId);
      
      

      const response = await studentService.update(userId, payload);
      
      

      // Delete the old image only if the update is successful and old image exists
      if (oldImagePath) {
        try {
          fs.unlink(oldImagePath);
        } catch (unlinkError) {
          console.error("Error deleting old image:", unlinkError);
        }
      }

      console.log("Update user response:", response);
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
    const payload = await userService.getUserById(id);

    if (!payload) {
      return res.status(404).json({ message: 'User not found' });
    }
    payload.is_verified = true;
    const response = await userService.update(id, payload);


    const institute = await instituteService.get(id);
    if (institute) {
      institute.status = true;
      const instituteresponse = await instituteService.update(id, institute);
    }

    return res.status(200).json({ message: 'User verified successfully', data: response });
  } catch (error) {
    console.error('Error in allowUser:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


export async function denyUser(req, res) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const payload = await userService.getUserById(id);

    if (!payload) {
      return res.status(404).json({ message: 'User not found' });
    }
    payload.is_verified = false;

    const response = await userService.update(id, payload);
    payload.status = false;

    //get institute
    const institute = await instituteService.get(id);
    if(institute){
      institute.status = false; 
      const instituteresponse = await instituteService.update(id, institute);
    }
    return res.status(200).json({ message: 'User block successfully', data: response });
  } catch (error) {
    console.error('Error in allowUser:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

//getMyRefferal
export async function getMyRefferal(req, res) {
  try {
    const userId = req.user._id;
    const response = await userService.getMyRefferal(userId);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the user";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.error('Error in getMyRefferal:', error.message);

    return res.status(error.statusCode).json(ErrorResponse);
  }
}


export async function getAllRefferal(req, res) {
  try {
    const userId = req.user._id;
    const response = await userService.getAllRefferal(userId);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the user";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.error('Error in all Refferal:', error.message);

    return res.status(error.statusCode).json(ErrorResponse);
  }
}


//redeemPoints
export async function redeemPoints(req, res) {
  try {
    const user = req.user;
    const userId = req.user._id;
    console.log('user:', user.points);
    const points = req.body.points;
    const userpoints = req.user.points;
    console.log('user:', user);
    console.log('points:', points);

    if(user.role == 'cousellor'){
      const counsellor = await counselorService.get(user.email);
      userpoints = counsellor.points;
    }

    if (points < 100){
      return res.status(400).json({ status: "failed", message: "minimum points required to redeem is 100" });
    }

    console.log('userpoints:', userpoints);

    if (userpoints < points) {
      return res.status(400).json({ status: "failed", message: "Insufficient points to redeem" });
    }


    const response = await userService.redeemPoints(userId, points);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the user";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.error('Error in redeemPoints:', error.message);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}


//earningReports
export async function earningReports(req, res) {
  try {
    // const userId = req.user._id;
    const response = await userService.earningReports();
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the user";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.error('Error in earningReports:', error.message);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

//getRedeemHistory
export async function getRedeemHistory(req, res) {
  try {
    const userId = req.user._id;
    const response = await userService.getRedeemHistory(userId);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the user";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error('Error in getRedeemHistory:', error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
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
