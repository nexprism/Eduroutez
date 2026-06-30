import { StatusCodes } from "http-status-codes";
import WishlistService from "../services/wishlist-service.js";
import UserService from "../services/user-service.js";
import InstituteService from "../services/institute-service.js";
import CourseService from "../services/course-service.js";
import ActivityService from "../services/activity-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import AppError from "../utils/errors/app-error.js";
const wishlistService = new WishlistService();
const userService = new UserService();
const instituteService = new InstituteService();
const courseService = new CourseService();
const activityService = new ActivityService();


/**
 * POST : /wishlist
 * req.body {}
 */
export const createWishlist = async (req, res) => {
  try {
    const student = req.user; // This is the full user object
    const studentId = student._id; // Extract just the ID
    const { instituteId, courseId } = req.body;
    
    // Retrieve user by ID to get the latest data
    const user = await userService.getUserById(studentId);
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }
    
    // Function to update wishlist
    const updateWishlist = async (wishlistField, itemId, addMessage, removeMessage) => {
      if (!Array.isArray(user[wishlistField])) {
        user[wishlistField] = [];
      }
     
      const itemIndex = user[wishlistField].findIndex(id => id.toString() === itemId.toString());
     
      // Fetch the item name for activity logging
      let targetName = "";
      try {
        if (wishlistField === 'college_wishlist') {
          const c = await instituteService.get(itemId);
          if (c) targetName = c.instituteName || "";
        } else {
          const c = await courseService.get(itemId);
          if (c) targetName = c.courseTitle || "";
        }
      } catch {}
     
      if (itemIndex > -1) {
        user[wishlistField].splice(itemIndex, 1);
        await userService.update(studentId, { [wishlistField]: user[wishlistField] });
       
        if (wishlistField === 'college_wishlist') {
          try {
            const college = await instituteService.get(itemId);
            if (college) {
              if (!Array.isArray(college.wishlist)) college.wishlist = [];
              const studentIndex = college.wishlist.findIndex(id => id.toString() === studentId.toString());
              if (studentIndex > -1) {
                college.wishlist.splice(studentIndex, 1);
                await instituteService.update(itemId, { wishlist: college.wishlist });
              }
            }
          } catch {}
        }
       
        const activityType = wishlistField === 'college_wishlist' ? "unwishlist_institute" : "unwishlist_course";
        const targetType = wishlistField === 'college_wishlist' ? "Institute" : "Course";
        activityService.logActivity(studentId, activityType, targetType, itemId, targetName);
       
        return res.status(StatusCodes.OK).json({ message: removeMessage });
      } else {
        user[wishlistField].push(itemId);
        await userService.update(studentId, { [wishlistField]: user[wishlistField] });
       
        if (wishlistField === 'college_wishlist') {
          try {
            const college = await instituteService.get(itemId);
            if (college) {
              if (!Array.isArray(college.wishlist)) college.wishlist = [];
              if (!college.wishlist.some(id => id.toString() === studentId.toString())) {
                college.wishlist.push(studentId);
                await instituteService.update(itemId, { wishlist: college.wishlist });
              }
            }
          } catch {}
        }
       
        const activityType = wishlistField === 'college_wishlist' ? "wishlist_institute" : "wishlist_course";
        const targetType = wishlistField === 'college_wishlist' ? "Institute" : "Course";
        activityService.logActivity(studentId, activityType, targetType, itemId, targetName);
       
        return res.status(StatusCodes.CREATED).json({ message: addMessage });
      }
    };
    
    // Process course wishlist
    if (courseId) {
      return await updateWishlist(
        'course_wishlist',
        courseId,
        "Successfully added course to wishlist",
        "Successfully removed course from wishlist"
      );
    }
    
    // Process institute wishlist
    if (instituteId) {
      return await updateWishlist(
        'college_wishlist',
        instituteId,
        "Successfully added college to wishlist",
        "Successfully removed college from wishlist"
      );
    }
    
    // If neither courseId nor instituteId is provided
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Either courseId or instituteId must be provided"
    });
    
  } catch (error) {
    console.log("Create wishlist error:", error.message);
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: error.message || "Internal Server Error"
    });
  }
};

/**
 * GET : /wishlist
 * req.body {}
 */

export async function getWishlists(req, res) {
  try {
    const studentId = req.user;
    const user = await userService.getUserById(studentId);
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }
    // console.log("user.college_wishlist", user.college_wishlist);

    
    // console.log("user.course_wishlist", user.course_wishlist);
    const response = {};
    if (user.college_wishlist.length > 0) {
      const collegeDetailsList = [];

      for (const collegeId of user.college_wishlist) {
        const college = await instituteService.get(collegeId);
        const collegeDetails = {
          _id: college._id,
          instituteName: college.instituteName,
          establishedYear: college.establishedYear,
          collegeInfo: college.collegeInfo,
          coverImage: college.coverImage,
          thumbnailImage: college.thumbnailImage,
          highestPackage: college.highestPackage,
          averagePackage: college.averagePackage,
        };

        // Push the current college details into the collegeDetailsList array
        collegeDetailsList.push(collegeDetails);
      }

      // Assign the array to the response object
      response['college_wishlist'] = collegeDetailsList;
    }

    

    if(user.course_wishlist.length > 0){
    const courseList = [];
    for (const courseId of user.course_wishlist) {
      const course = await courseService.get(courseId);
      if (course) {
        courseList.push({
          _id: course._id,
          courseTitle: course.courseTitle,
          coursePrice: course.coursePrice,
          shortDescription: course.shortDescription,
          coursePreviewThumbnail: course.coursePreviewThumbnail,
          slug: course.slug,
        });
      }
    }
    response['course_wishlist'] = courseList;
  }

    // const response = { college_wishlist, course_wishlist };
    // console.log("response", response);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched wishlists";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Get wishlists error:", error.message);
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
