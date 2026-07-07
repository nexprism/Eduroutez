import { StatusCodes } from "http-status-codes";
import { ErrorResponse } from "../utils/common/index.js";

// Helper to check for emojis (unicode pictographs)
function hasEmoji(str) {
    try {
        const emojiRegex = /\p{Extended_Pictographic}/u;
        return emojiRegex.test(str);
    } catch (e) {
        // Fallback if environment doesn't support modern unicode property escapes
        const fallbackRegex = /[\uD800-\uDFFF]./;
        return fallbackRegex.test(str);
    }
}

// Helper to check for the word "emoji"
function containsWordEmoji(str) {
    return /emoji/i.test(str);
}

export function validateCreateQuery(req, res, next) {
    const { name, email, phoneNo, query, city, queryRelatedTo, specialization } = req.body;

    // 1. Mandatory Field Validation
    if (!name || typeof name !== "string" || name.trim() === "") {
        ErrorResponse.message = "Validation Error";
        ErrorResponse.error = { explanation: "Name is required and must be a valid text string." };
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
        ErrorResponse.message = "Validation Error";
        ErrorResponse.error = { explanation: "Email is required and must be a valid text string." };
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!phoneNo || typeof phoneNo !== "string" || phoneNo.trim() === "") {
        ErrorResponse.message = "Validation Error";
        ErrorResponse.error = { explanation: "Phone number is required and must be a valid text string." };
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!query || typeof query !== "string" || query.trim() === "") {
        ErrorResponse.message = "Validation Error";
        ErrorResponse.error = { explanation: "Query description is required and must be a valid text string." };
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // 2. Format Validation
    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        ErrorResponse.message = "Validation Error";
        ErrorResponse.error = { explanation: "Please provide a valid email address." };
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // Validate Phone Format (allow +, -, digits, spaces, parentheses, length 7 to 15)
    const cleanPhone = phoneNo.trim();
    const phoneRegex = /^[\d\s+\-()]{7,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
        ErrorResponse.message = "Validation Error";
        ErrorResponse.error = { explanation: "Please provide a valid phone number. E.g. digits, spaces, hyphens only (7 to 15 characters)." };
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // 3. Emoji and Invalid Content Check
    const fieldsToCheck = { name, email, phoneNo, query, city, queryRelatedTo, specialization };

    for (const [key, value] of Object.entries(fieldsToCheck)) {
        if (value && typeof value === "string") {
            if (hasEmoji(value) || containsWordEmoji(value)) {
                ErrorResponse.message = "Validation Error";
                ErrorResponse.error = { explanation: `Invalid characters or content detected in ${key}.` };
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }
        }
    }

    next();
}
