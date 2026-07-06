import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        language: {
            type: String,
            default: "en",
        },
        messages: {
            type: [messageSchema],
            default: [],
        },
        context: {
            // optional: last queried institute/course for follow-up questions
            instituteId: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", default: null },
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Auto-expire sessions after 7 days of inactivity
chatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
export default ChatSession;
