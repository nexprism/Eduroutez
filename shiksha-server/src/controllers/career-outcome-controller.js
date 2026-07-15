import { StatusCodes } from "http-status-codes";
import { predictCareerOutcome } from "../services/career-outcome-service.js";

export async function predictCareerOutcomeController(req, res) {
  try {
    const { career, careerId, educationLevel, location, skills } = req.body || {};

    if (!career && !careerId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "career (text) or careerId is required",
      });
    }

    const data = await predictCareerOutcome({
      career,
      careerId,
      educationLevel,
      location,
      skills,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data,
      message: "Career outcome predicted successfully",
    });
  } catch (error) {
    console.error("predictCareerOutcomeController error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to predict career outcome",
    });
  }
}
