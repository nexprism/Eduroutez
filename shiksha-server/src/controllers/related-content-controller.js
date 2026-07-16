import { StatusCodes } from "http-status-codes";
import { getRelatedContent } from "../services/related-content-service.js";

export async function relatedContentController(req, res) {
  try {
    const { contentId, contentType, limit } = req.query;

    if (!contentId || !contentType) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "contentId and contentType are required",
      });
    }

    const validTypes = ["blog", "career", "course", "institute"];
    if (!validTypes.includes(contentType)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `contentType must be one of: ${validTypes.join(", ")}`,
      });
    }

    const data = await getRelatedContent({
      contentId,
      contentType,
      limit: parseInt(limit) || 6,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data,
      message: "Related content fetched successfully",
    });
  } catch (error) {
    console.error("relatedContentController error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch related content",
    });
  }
}
