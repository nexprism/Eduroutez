import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

const isAdminRole = (role) => ["admin", "superadmin", "SUPER_ADMIN"].includes(role);

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new AppError(
        "Unauthorized: No user found",
        StatusCodes.UNAUTHORIZED
      );
    }

    // Check if user role is admin, superadmin, or SUPER_ADMIN
    if (!isAdminRole(user.role)) {
      throw new AppError(
        "Forbidden: Only admins can perform this action",
        StatusCodes.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.FORBIDDEN)
      .json({
        success: false,
        message: error.message,
        error: error,
      });
  }
};

/**
 * Middleware to check if user has institute role
 */
export const requireInstitute = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new AppError(
        "Unauthorized: No user found",
        StatusCodes.UNAUTHORIZED
      );
    }

    // Check if user role is 'institute'
    if (user.role !== "institute") {
      throw new AppError(
        "Forbidden: Only institutes can perform this action",
        StatusCodes.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.FORBIDDEN)
      .json({
        success: false,
        message: error.message,
        error: error,
      });
  }
};

/**
 * Middleware to check if user is admin or superadmin
 */
export const requireAdminOrSuper = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new AppError(
        "Unauthorized: No user found",
        StatusCodes.UNAUTHORIZED
      );
    }

    if (!isAdminRole(user.role)) {
      throw new AppError(
        "Forbidden: Insufficient permissions",
        StatusCodes.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.FORBIDDEN)
      .json({
        success: false,
        message: error.message,
        error: error,
      });
  }
};

/**
 * Middleware to verify ownership or admin status
 * Used when institutes should only access their own data
 */
export const verifyOwnershipOrAdmin = (paramKey = "instituteId") => {
  return (req, res, next) => {
    try {
      const user = req.user;
      const resourceOwnerId = req.params[paramKey] || req.body[paramKey];

      if (!user) {
        throw new AppError(
          "Unauthorized: No user found",
          StatusCodes.UNAUTHORIZED
        );
      }

      // Admin can access anything
      if (isAdminRole(user.role)) {
        return next();
      }

      // Institute can only access their own data
      if (user.role === "institute" && user._id.toString() !== resourceOwnerId) {
        throw new AppError(
          "Forbidden: You can only access your own data",
          StatusCodes.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      return res
        .status(error.statusCode || StatusCodes.FORBIDDEN)
        .json({
          success: false,
          message: error.message,
          error: error,
        });
    }
  };
};
