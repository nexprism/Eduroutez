import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import AdminService from "../services/admin-service.js";
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
