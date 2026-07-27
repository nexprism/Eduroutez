import { StatusCodes } from "http-status-codes";
import * as ChatbotService from "../services/chatbot-service.js";

// POST /api/v1/chatbot/chat
export async function chatWithBot(req, res) {
    try {
        const { message, sessionId, language } = req.body;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "message is required and must be a non-empty string",
            });
        }

        const userId = req.user?._id || null;
        const ipAddress = req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"] || null;

        const result = await ChatbotService.chat({
            sessionId: sessionId || null,
            message: message.trim(),
            language: language || "en",
            userId,
            ipAddress,
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("chatWithBot error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to process chat message",
        });
    }
}

// GET /api/v1/chatbot/history/:sessionId
export async function getChatHistory(req, res) {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "sessionId is required",
            });
        }
        const history = await ChatbotService.getHistory(sessionId);
        return res.status(StatusCodes.OK).json({ success: true, data: history });
    } catch (error) {
        console.error("getChatHistory error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to fetch chat history",
        });
    }
}

// DELETE /api/v1/chatbot/session/:sessionId
export async function deleteChatSession(req, res) {
    try {
        const { sessionId } = req.params;
        const result = await ChatbotService.clearSession(sessionId);
        return res.status(StatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
        console.error("deleteChatSession error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to delete chat session",
        });
    }
}

// GET /api/v1/chatbot/sessions  (admin – authenticated)
export async function listChatSessions(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await ChatbotService.listSessions({ page, limit });
        return res.status(StatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
        console.error("listChatSessions error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to list sessions",
        });
    }
}
