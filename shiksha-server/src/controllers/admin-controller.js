import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import AdminService from "../services/admin-service.js";
import User from "../models/User.js";
import { Token } from "../utils/index.js";
import { getFilteredInstitutes } from "./institute-controller.js";
const multiUploader = FileUpload.upload.fields([
  {
    name: "image",
    maxCount: 1,
  },
]);
const adminService = new AdminService();

/**
 * POST : /admin
 * req.body {}
 */
// export const createAdmin = async (req, res) => {
//   try {
//     multiUploader(req, res, async function (err, data) {
//       if (err) {
//         return res.status(500).json({ error: err });
//       }

//       const payload = { ...req.body };
//       if (req.files["image"]) {
//         payload.image = req.files["image"][0].filename;
//       }

//       const response = await adminService.create(payload);

//       SuccessResponse.data = response;
//       SuccessResponse.message = "Successfully created a admin";

//       return res.status(StatusCodes.CREATED).json(SuccessResponse);
//     });
//   } catch (error) {
//     ErrorResponse.error = error;
//     return res.status(error.statusCode).json(ErrorResponse);
//   }
// };

export const createAdmin = async (req, res) => {
  try {
    multiUploader(req, res, async function (err) {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong. Please try again later." });
      }

      const payload = { ...req.body };
      if (req.files["image"]) {
        payload.image = req.files["image"][0].filename;
      }

      try {
        const response = await adminService.create(payload);

        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully created an admin";

        return res.status(StatusCodes.CREATED).json(SuccessResponse);
      } catch (error) {
        console.log("here");
        ErrorResponse.error = error;
        return res.status(500).json(ErrorResponse);
      }
    });
  } catch (error) {
    console.log("there");
    ErrorResponse.error = error;
    return res.status(500).json(ErrorResponse);
  }
};
export async function getAdmins(req, res) {
  try {
    const response = await adminService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched admins";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

// Get filtered institutes (SuperAdmin only) - uses checkbox filtering logic
export const getFilteredInstitutesAdmin = async (req, res) => {
  try {
    const requestingUser = req.user;
    if (!requestingUser || requestingUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can perform this action',
        data: {},
        err: {}
      });
    }

    // Use the checkbox filtering logic which handles comma-separated values
    return await getFilteredInstitutes(req, res);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode || 500).json(ErrorResponse);
  }
}

export const loginAsInstitute = async (req, res) => {
  try {
    const requestingUser = req.user;
    if (!requestingUser || requestingUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can perform this action',
        data: {},
        err: {}
      });
    }

    const { id } = req.params;
    const instituteUser = await User.findById(id);
    if (!instituteUser) {
      return res.status(404).json({
        success: false,
        message: 'Institute user not found',
        data: {},
        err: {}
      });
    }

    if (instituteUser.role !== 'institute') {
      return res.status(400).json({
        success: false,
        message: 'Target user is not an institute',
        data: {},
        err: {}
      });
    }

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await Token.generateTokens(instituteUser);

    Token.setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

    const userObj = instituteUser.toObject ? instituteUser.toObject() : instituteUser;
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Successfully logged in as institute',
      data: { accessToken, refreshToken, accessTokenExp, refreshTokenExp, user: userObj },
      err: {}
    });

  } catch (error) {
    console.log('loginAsInstitute error', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      err: error
    });
  }
};
