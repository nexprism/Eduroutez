import fs from "fs/promises";
import { ServerConfig } from "../config/index.js";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import InstituteService from "../services/institute-service.js";
import UserService from "../services/user-service.js";
import { UserRepository } from "../repository/user-repository.js";
import xlsx from "xlsx";
import mongoose from "mongoose";
import Institute from "../models/Institute.js";
import User from "../models/User.js";
import { cp } from "fs";
import multer from "multer";
import bcrypt from "bcrypt";


const singleUploader = FileUpload.upload.single("image");
const fileUploader = FileUpload.upload.single("file");

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
  },
  {
    name: "file",
    maxCount: 1,
  },

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

//getIssue
export async function getIssue(req, res) {
  try {
    const response = await instituteService.getIssue(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched issue";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get issue error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
}

//megamenuCollages
export async function megamenuCollages(req, res) {
  try {
    const response = await instituteService.megamenuCollages();
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched mega menu colleges";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get mega menu colleges error:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
}

//bestRatedInstitute
export async function bestRatedInstitute(req, res) {
  try {
    const response = await instituteService.bestRatedInstitute();
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched institutes";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get institutes error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
}

//trendingInstitute
export async function trendingInstitute(req, res) {
  try {
    const response = await instituteService.trendingInstitute();
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched institutes";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get institutes error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
}


export const bulkAddInstitutes = async (req, res) => {
  fileUploader(req, res, async function (err) {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const file = req.file;
      if (!file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "No file uploaded" });
      }

      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const users = [];
      const institutes = [];

      for (const row of data) {
        const existingUser = await User.findOne({ email: row.email });
        if (existingUser) {
          console.log(`Skipping row with email ${row.email} as it already exists`);
          continue;
        }

        const userId = new mongoose.Types.ObjectId();
        var password = row.password;
         const salt = bcrypt.genSaltSync(+ServerConfig.SALT);
            const hashedPassword = bcrypt.hashSync(password, salt);
             

        users.push({
          _id: userId,
          name: row.instituteName,
          email: row.email,
          password: hashedPassword,
          role: "institute",
          is_verified: true,
        });

        institutes.push({
          _id: userId,
          instituteName: row.instituteName,
          email: row.email,
          institutePhone: row.institutePhone,
          address: row.address,
          state: row.state,
          city: row.city,
          establishedYear: row.establishedYear,
          website: row.website,
          about: row.about,
          instituteLogo: row.instituteLogo,
          coverImage: row.coverImage,
          thumbnailImage: row.thumbnailImage,
          organisationType: row.organisationType,
          brochure: row.brochure,
          // subscriptionType: row.subscriptionType,
          // courses: row.courses,
          collegeInfo: row.collegeInfo,
          isTrending: row.isTrending,
          courseInfo: row.courseInfo,
          admissionInfo: row.admissionInfo,
          placementInfo: row.placementInfo,
          fee: row.fee,
          ranking: row.ranking,
          cutoff: row.cutoff,
          campusInfo: row.campusInfo,
          scholarshipInfo: row.scholarshipInfo,
          minFees: row.minFees,
          maxFees: row.maxFees,
          affiliation: row.affiliation,
          highestPackage: row.highestPackage,
          // reviews: row.reviews,
          streams: row.streams,
          specialization: row.specialization,
          // gallery: row.gallery,
          facilities: row.facilities,
          password: row.password,
          // status: row.status,
        });
      }

      console.log("Users:", users);

      await User.insertMany(users);
      await Institute.insertMany(institutes);

      SuccessResponse.data = institutes;
      SuccessResponse.message = "Successfully added institutes in bulk";
      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
      console.error("Bulk add institutes error:", error.message);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
};

/**
 * GET : /institute/:id
 * req.body {}
 */

export async function getInstitute(req, res) {
  try {
    console.log('hello',req.params.id);
    const response = await instituteService.get(req.params.id);
    console.log('response in getInstitute',response);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the institute";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get institute error:", error.message); 
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
      // console.log('hjkl',req.files);
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

      if (payload.instituteName) {
        payload.slug = payload.instituteName.toLowerCase().replace(/ /g, "-");
      }
      
      // if (req.files["gallery"]) {
      //   payload.gallery = req.files["gallery"].map((file) => file.filename);
      // }

      // Update the institute with new data
      // console.log(payload);
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

//deleteFacility
export async function deleteFacility(req, res) {
  try {
    const instituteId = req.params.id;
    const facilityId = req.body.facility;
    const response = await instituteService.deleteFacility(instituteId, facilityId);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted facility from the institute";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

//deleteGallery
export async function deleteGallery(req, res) {
  try {
    const instituteId = req.params.id;
    const galleryimg = req.body.image;
    const response = await instituteService.deleteGallery(instituteId, galleryimg);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted gallery image from the institute";
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

//updateIssue status
export async function updateIssue(req, res) {
  try {
    const issueId = req.params.id;
    const payload = req.body;

    if (payload.status) {
      payload.status = payload.status
    }

    console.log('payload',payload);

    const response = await instituteService.updateIssue(issueId, payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated issue status";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log('error in updateIssue',error.message);
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

//downloadBruchure
export async function downloadBruchure(req, res) {
  try {
    const instituteId = req.params.id;
    const brochure = await instituteService.downloadBruchure(instituteId);

    // console.log('brochure',brochure);

    // console.log('filePath',ServerConfig.UPLOAD_DIR);
    
    const filePath = path.join('uploads', brochure);

    console.log('test filePath',filePath);


    res.download(filePath, brochure, (err) => {

      if (err) {
        console.error("Error test watch downloading brochure:", err.message);
        ErrorResponse.error
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
      }

      
    });

    StatusCodes.message = "Successfully downloaded brochure";
    res.status(StatusCodes.OK);

    return res;



    
  } catch (error) {
    console.error("Download test watch brochure error:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}




export async function getHelpList(req, res) {
  try {
    const response = await instituteService.getHelpList();
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched help list";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

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
