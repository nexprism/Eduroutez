import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import InstituteService from "../services/institute-service.js";
import UserService from "../services/user-service.js";
import { UserRepository } from "../repository/user-repository.js";

const singleUploader = FileUpload.upload.single("image");
const multiUploader = FileUpload.upload.fields([
  {
    name: "instituteLogo",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1,
  },
  {
    name: "thumbnailImage",
    maxCount: 1,
  },
  {
    name: "brochure",
    maxCount: 1,
  },
  {
    name: "gallery",
    maxCount: 10,
  },
  {
    name: "image",
    maxCount: 1,
  }
]);
const instituteService = new InstituteService();
const userService = new UserService();

/**
 * POST : /institute
 * req.body {}
 */
export const createInstitute = async (req, res) => {
  try {
    // Create the user first
    const userPayload = {
      name: req.body.instituteName,
      email: req.body.email,
      password: req.body.password,
      role: "institute",
      is_verified: true,
    };

    const userResponse = await userService.signup(userPayload, res);
    console.log('userResponse',userResponse);
    const userId = userResponse.user._id;

    const institutePayload = {
      ...req.body,
      _id: userId,
      is_verified: true,
    };
    console.log('institutePayload',institutePayload);
    const instituteResponse = await instituteService.create(institutePayload);

    SuccessResponse.data = {
      user: userResponse,
      institute: instituteResponse,
    };
    SuccessResponse.message = "Successfully created an institute";

    

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log(error.message);

    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
};




export const upgradeInstitute = async (req, res) => {
  try {
      const payload = { ...req.body };
      const response = await instituteService.Upgrade(req.params.email, payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully upgraded the institute";

      return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
};

export const makeInstitute = async (req, res) => {
  // console.log('hi1')
  try {
    multiUploader(req, res, async function (err, data) {
      if (err) {
        return res.status(500).json({ error: err });
      }
      // console.log('hi2')
    const payload = { ...req.body };
    // console.log(payload);

    if (req.files["instituteLogo"]) {
      payload.instituteLogo = req.files["instituteLogo"][0].filename;
    }
    if (req.files["coverImage"]) {
      payload.coverImage = req.files["coverImage"][0].filename;
    }
    if (req.files["thumbnailImage"]) {
      payload.thumbnailImage = req.files["thumbnailImage"][0].filename;
    }
    if (req.files["brochure"]) {
      payload.brochure = req.files["brochure"][0].filename;
    }
    if (req.files["gallery"]) {
      payload.gallery = req.files["gallery"].map((file) => file.filename);
    }

    const response = await instituteService.make(req.params.email,payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created an institute";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
};

/**
 * GET : /institute
 * req.body {}
 */

export async function getInstitutes(req, res) {
  try {
    const response = await instituteService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched institutes";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get institutes error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
}

/**
 * GET : /institute/:id
 * req.body {}
 */

export async function getInstitute(req, res) {
  try {
    const response = await instituteService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the institute";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode||500).json(ErrorResponse);
  }
}

export async function getInstituteByEmail(req, res) {
  try {
    console.log('hello',req.params.email);
    const response = await instituteService.getbyemail(req.params.email);
    console.log(response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the institute";
    return res.status(200).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(500).json(ErrorResponse);
  }
}

/**
 * PATCH : /institute/:id
 * req.body {capacity:200}
 */

export async function updateInstitute(req, res) {
  multiUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const instituteId = req.params.id;
      const payload = req.body;
      let oldImagePath;
      // console.log(req.files);
      // console.log(req.file);
      // Check if a new title is provided
      // if (req.body.title) {
      //   payload.title = req.body.title;
      // }

      // console.log('hi')
      // Check if a new image is uploaded
      // if (req.file) {
      //   const institute = await instituteService.get(instituteId);

      //   console.log(institute);
      //   // Record the old image path if it exists
      //   if (institute.image) {
      //     oldImagePath = path.join("uploads", institute.image);
      //   }

      //   // Set the new image filename in payload
      //   payload.image = req.file.filename;
      // }


      if (req.files["instituteLogo"]) {
        payload.instituteLogo = req.files["instituteLogo"][0].filename;
      }
      if (req.files["coverImage"]) {
        payload.coverImage = req.files["coverImage"][0].filename;
      }
      if (req.files["thumbnailImage"]) {
        payload.thumbnailImage = req.files["thumbnailImage"][0].filename;
      }
      if (req.files["brochure"]) {
        payload.brochure = req.files["brochure"][0].filename;
      }
      // if (req.files["gallery"]) {
      //   payload.gallery = req.files["gallery"].map((file) => file.filename);
      // }

      // Update the institute with new data
      console.log(payload);
      const response = await instituteService.update(instituteId, payload);
      // console.log(response);

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
      SuccessResponse.message = "Successfully updated the institute";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update institute error:", error);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}


export async function addFacility(req, res) {
  try {
    const instituteId = req.params.id;
    const payload = req.body;
    if (payload.facilities) {
      payload.facilities = payload.facilities.map(facility => facility.data);
    }
    const response = await instituteService.addFacility(instituteId, payload);

    SuccessResponse.data = response;
    console.log('response',response);
    SuccessResponse.message = "Successfully added facility to the institute";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

export const submitIssue = async (req, res) => {
  try {
    const instituteId = req.user;
    console.log('instituteId',instituteId);
    multiUploader(req, res, async function (err) {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
      }

      console.log('file',req.files);

      const payload = { ...req.body };

      if (req.files && req.files["image"]) {
        payload.image = req.files["image"][0].filename;
      }
      
    const response = await instituteService.submitIssue(instituteId, payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully submitted issue to the admin";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};
// export async function submitIssue(req, res) {
//   try {
//     const instituteId = req.user;
//     //form data from req 
//     const formdata = req.body;
//     singleUploader(req, res, async function (err) {
//       if (err) {
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
//       }
//     }
//     );

//     const payload = { ...req.body };
//     console.log('payload',payload);
//     if (req.files && req.files["image"]) {
//       payload.image = req.files["image"][0].filename;
//     }
  
//     const response = await instituteService.submitIssue(instituteId, payload);

//     SuccessResponse.data = response;
//     SuccessResponse.message = "Successfully submitted issue to the institute";
//     return res.status(StatusCodes.OK).json(SuccessResponse);
//   } catch (error) {
//     ErrorResponse.error = error;
//     return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//   }
// }



export const addGallery = async (req, res) => {
  try {
    multiUploader(req, res, async function (err) {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
      }

      console.log('file',req.files);


      const instituteId = req.params.id;
      const payload = { ...req.body };
      // console.log(payload);

    
      if (req.files["gallery"]) {
        payload.gallery = req.files["gallery"].map((file) => file.filename);
      }
      console.log('payload',payload);
      const response = await instituteService.addGallery(instituteId, payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully added gallery images to the institute";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};


      




/**
 * DELETE : /institute/:id
 * req.body {}
 */

export async function deleteInstitute(req, res) {
  try {
    const response = await instituteService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the institute";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
