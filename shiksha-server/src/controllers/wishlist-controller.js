import { StatusCodes } from "http-status-codes";
import WishlistService from "../services/wishlist-service.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
const wishlistService = new WishlistService();

/**
 * POST : /wishlist
 * req.body {}
 */
export const createWishlist = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.image = req.file.filename;

    const response = await wishlistService.create(payload);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created a wishlist";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
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
