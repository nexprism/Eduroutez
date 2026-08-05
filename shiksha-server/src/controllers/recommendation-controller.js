import { StatusCodes } from "http-status-codes";
import { getRecommendations, getNearbyStatesFor } from "../services/recommendation-service.js";

export async function recommendController(req, res) {
  try {
    const { marks, exam, category, budget, preferredCourse, state, city, educationLevel, userId } = req.body || {};

    // Optional authenticated user (behavior signals). Prefer token identity if present.
    const behaviorUserId = req.user?._id || userId || null;

    const data = await getRecommendations(
      { marks, exam, category, budget, preferredCourse, state, city, educationLevel },
      behaviorUserId
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      data,
      message: "Recommendations generated successfully",
    });
  } catch (error) {
    console.error("recommendController error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to generate recommendations",
    });
  }
}

// Nearby states for a given state (same logic the recommendation engine uses),
// exposed so the client engine and UI can mirror the geo fallback quickly.
export async function nearbyStatesController(req, res) {
  try {
    const state = req.query.state || req.body?.state;
    if (!state) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "state query parameter is required",
      });
    }
    const nearbyStates = await getNearbyStatesFor(state);
    return res.status(StatusCodes.OK).json({
      success: true,
      data: { state, nearbyStates },
      message: "Nearby states fetched successfully",
    });
  } catch (error) {
    console.error("nearbyStatesController error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch nearby states",
    });
  }
}
