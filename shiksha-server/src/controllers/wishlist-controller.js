import { StatusCodes } from "http-status-codes";
import WishlistService from "../services/wishlist-service.js";
import UserService from "../services/user-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const wishlistService = new WishlistService();
const userService = new UserService();


/**
 * POST : /wishlist
 * req.body {}
 */
export const createWishlist = async (req, res) => {
  try {
    const studentId = req.user;
    console.log("req.body", req.body);
    const { instituteId, courseId } = req.body;
    const data = { studentId, instituteId, courseId };

    
    //get user by id
    const user = await userService.getUserById(studentId);
    
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    if (courseId && user.course_wishlist.includes(courseId)) {
      user.course_wishlist = user.course_wishlist.filter((course) => course !== courseId);
      
      await user.save();
      SuccessResponse.message = "Successfully removed course from wishlist";
      return res.status(StatusCodes.OK).json(SuccessResponse);

    }else{
    
        user.course_wishlist.push(courseId);

        //save user
        await user.save();
        SuccessResponse.message = "Successfully added course to wishlist";
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
        

    }

    //check college_wishlist
    if (instituteId && user.college_wishlist.includes(instituteId)) {
      user.college_wishlist = user.college_wishlist.filter((college) => college !== instituteId);
      await user.save();
      SuccessResponse.message = "Successfully removed college from wishlist";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    }else{
      user.college_wishlist.push(instituteId);
      await user.save();
      SuccessResponse.message = "Successfully added college to wishlist";
      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    }
    
  } catch (error) {
    console.log("Create wishlist error:", error.message);
    ErrorResponse.error = error;    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
};

/**
 * GET : /wishlist
 * req.body {}
 */

export async function getWishlists(req, res) {
  try {
    const response = await wishlistService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched wishlists";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /wishlist/:id
 * req.body {}
 */

export async function getWishlist(req, res) {
  try {
    const response = await wishlistService.get(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the wishlist";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * PATCH : /wishlist/:id
 * req.body {capacity:200}
 */

export async function updateWishlist(req, res) {
  try {
    const wishlistId = req.params.id;
    const payload = {};

    if (req.body.title) {
      payload.title = req.body.title;
    }

    const response = await wishlistService.update(wishlistId, payload);

    // Return success response
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully updated the wishlist";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Update wishlist error:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

/**
 * DELETE : /wishlist/:id
 * req.body {}
 */

export async function deleteWishlist(req, res) {
  try {
    const response = await wishlistService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the wishlist";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
