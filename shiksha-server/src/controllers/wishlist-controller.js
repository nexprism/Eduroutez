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
      // Check if the wishlist field is valid and user has the property
      if (!Array.isArray(user[wishlistField])) {
        user[wishlistField] = []; // Initialize as empty array if doesn't exist
      }
     
      // Check if item is already in the wishlist - using ObjectId string comparison
      const itemIndex = user[wishlistField].findIndex(id => id.toString() === itemId.toString());
     
      if (itemIndex > -1) {
        // Item exists, remove it from user's wishlist
        user[wishlistField].splice(itemIndex, 1);
        await user.save();
        console.log(`Removed ${itemId} from user ${studentId}'s ${wishlistField}`);
       
        if (wishlistField === 'college_wishlist') {
          const college = await instituteService.get(itemId);
          if (!college) {
            throw new AppError("College not found", StatusCodes.NOT_FOUND);
          }
         
          // Check if college has a wishlist array
          if (!Array.isArray(college.wishlist)) {
            college.wishlist = [];
          }
         
          // Find the index of studentId in college's wishlist
          const studentIndex = college.wishlist.findIndex(
            id => id.toString() === studentId.toString()
          );
         
          // If student exists in college wishlist, remove them
          if (studentIndex > -1) {
            college.wishlist.splice(studentIndex, 1);
            await instituteService.update(itemId, { wishlist: college.wishlist });
            console.log(`Removed student ${studentId} from college ${college.instituteName} wishlist`);
          }
        }
       
        return res.status(StatusCodes.OK).json({ message: removeMessage });
      } else {
        // Item doesn't exist in user's wishlist, add it
        user[wishlistField].push(itemId);
        await user.save();
        console.log(`Added ${itemId} to user ${studentId}'s ${wishlistField}`);
       
        if (wishlistField === 'college_wishlist') {
          const college = await instituteService.get(itemId);
          if (!college) {
            throw new AppError("College not found", StatusCodes.NOT_FOUND);
          }
         
          // Check if college has a wishlist array
          if (!Array.isArray(college.wishlist)) {
            college.wishlist = [];
          }
         
          // Check if student is already in college wishlist
          const studentExists = college.wishlist.some(
            id => id.toString() === studentId.toString()
          );
         
          // Only add student if they're not already in the college wishlist
          if (!studentExists) {
            college.wishlist.push(studentId);
            await instituteService.update(itemId, { wishlist: college.wishlist });
            console.log(`Added student ${studentId} to college ${college.instituteName} wishlist`);
          }
        }
       
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
    for (const courseId of user.course_wishlist) {
      const course = await courseService.get(courseId);
      //push in course_wishlist
      response['course_wishlist'] = course;
    }
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
