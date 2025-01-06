import { StatusCodes } from "http-status-codes";
import WishlistService from "../services/wishlist-service.js";
import UserService from "../services/user-service.js";
import InstituteService from "../services/institute-service.js";
import CourseService from "../services/course-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const wishlistService = new WishlistService();
const userService = new UserService();
const instituteService = new InstituteService();
const courseService = new CourseService();


/**
 * POST : /wishlist
 * req.body {}
 */
export const createWishlist = async (req, res) => {
  try {
    const studentId = req.user;
    const { instituteId, courseId } = req.body;

    // Retrieve user by ID
    const user = await userService.getUserById(studentId);
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    // Function to update wishlist
    const updateWishlist = async (wishlistField, itemId, addMessage, removeMessage) => {
      if (user[wishlistField].includes(itemId)) {
        user[wishlistField] = user[wishlistField].filter(item => item !== itemId);
        console.log("user[wishlistField]", user[wishlistField]);
        await user.save();
        SuccessResponse.message = removeMessage;
        return res.status(StatusCodes.OK).json(SuccessResponse);
      } else {
        user[wishlistField].push(itemId);
        await user.save();
        SuccessResponse.message = addMessage;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
      }
    };

    // Process course wishlist
    if (courseId) {
      await updateWishlist(
        'course_wishlist',
        courseId,
        "Successfully added course to wishlist",
        "Successfully removed course from wishlist"
      );
    }

    // Process institute wishlist
    if (instituteId) {
      await updateWishlist(
        'college_wishlist',
        instituteId,
        "Successfully added college to wishlist",
        "Successfully removed college from wishlist"
      );
    }

  } catch (error) {
    console.log("Create wishlist error:", error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

/**
 * GET : /wishlist
 * req.body {}
 */

export async function getWishlists(req, res) {
  try {
    const studentId = req.user;
    console.log("req.body", req.body);
    
    const user = await userService.getUserById(studentId);

    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const college_wishlist = {};
    const course_wishlist = {};

    for (const collegeId of user.college_wishlist) {
      const college = await instituteService.get(collegeId);
      college_wishlist[collegeId] = college;
    }

    for (const courseId of user.course_wishlist) {
      const course = await courseService.get(courseId);
      course_wishlist[courseId] = course;
    }

    const response = { college_wishlist, course_wishlist };


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
