import { StatusCodes } from "http-status-codes";
import { getTrends, askAI } from "../services/trend-service.js";

export async function getMarketTrends(req, res) {
    try {
        const trends = await getTrends();
        return res.status(StatusCodes.OK).json({
            success: true,
            data: trends,
            message: "Market trends fetched successfully",
        });
    } catch (error) {
        console.error("getMarketTrends error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to fetch market trends",
        });
    }
}

export async function askMarketQuestion(req, res) {
    try {
        const { question } = req.body;
        if (!question || typeof question !== "string" || question.trim().length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "question is required",
            });
        }
        const answer = await askAI(question.trim());
        return res.status(StatusCodes.OK).json({
            success: true,
            data: { answer },
        });
    } catch (error) {
        console.error("askMarketQuestion error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to get answer",
        });
    }
}
