import { ServerConfig } from "../config/index.js";
import Institute from "../models/Institute.js";
import Course from "../models/Course.js";
import Career from "../models/Career.js";
import ChatSession from "../models/ChatSession.js";
import FAQ from "../models/FAQ.js";
import { v4 as uuidv4 } from "uuid";

// ─────────────────────────────────────────────
//  OpenAI helper  (uses fetch – no extra pkg)
// ─────────────────────────────────────────────
async function callOpenAI(messages, options = {}) {
    const apiKey = ServerConfig.CHAT_GPT_API_KEY;
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const body = {
        model: options.model || "gpt-4o-mini",
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens || 800,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// ─────────────────────────────────────────────
//  Context builder – pulls live DB data
// ─────────────────────────────────────────────
async function buildContext(userMessage) {
    // Fetch up to 50 institutes (summary fields only)
    const institutes = await Institute.find({
        status: true,
        deletedAt: null,
    })
        .select(
            "instituteName address city state country organization organisationType " +
            "about admissionInfo admissionOpen fee minFees maxFees ranking " +
            "highestPackage facilities streams specialization examAccepted " +
            "affiliation establishedYear website slug"
        )
        .limit(60)
        .lean();

    // Fetch up to 80 courses
    const courses = await Course.find({ isActive: true, deletedAt: null })
        .select(
            "courseTitle courseType courseLevel shortDescription eligibility " +
            "courseFee courseDurationYears courseDurationMonths examAccepted " +
            "courseOpportunities category language slug"
        )
        .populate("courseCreatedBy", "instituteName")
        .limit(80)
        .lean();

    // Fetch careers
    const careers = await Career.find({ isActive: true, deletedAt: null })
        .select("title description category eligibility jobRoles opportunity topColleges")
        .limit(40)
        .lean();

    // Fetch global FAQs
    const faqs = await FAQ.find({ deletedAt: null })
        .select("question answer")
        .limit(30)
        .lean();

    return { institutes, courses, careers, faqs };
}

// ─────────────────────────────────────────────
//  System prompt builder
// ─────────────────────────────────────────────
function buildSystemPrompt({ institutes, courses, careers, faqs }, language) {
    const institutesSummary = institutes
        .map(
            (i) =>
                `• ${i.instituteName} (${i.organization || "Institute"}) – ${i.city?.name || ""
                }, ${i.state?.name || ""} | Fees: ${i.minFees || "?"}-${i.maxFees || "?"
                } | Streams: ${(i.streams || []).join(", ") || "N/A"} | AdmissionOpen: ${i.admissionOpen ? "Yes" : "No"
                } | Ranking: ${i.ranking || "N/A"}`
        )
        .join("\n");

    const coursesSummary = courses
        .map(
            (c) =>
                `• ${c.courseTitle} (${c.courseLevel || c.courseType || ""}) offered by ${c.courseCreatedBy?.instituteName || "Eduroutez Institute"
                } | Fee: ${c.courseFee || "N/A"} | Duration: ${c.courseDurationYears ? c.courseDurationYears + " yr" : ""
                } ${c.courseDurationMonths ? c.courseDurationMonths + " mo" : ""} | Eligibility: ${c.eligibility || "N/A"
                }`
        )
        .join("\n");

    const careersSummary = careers
        .map(
            (c) =>
                `• ${c.title} | Category: ${c.category || "N/A"} | Eligibility: ${c.eligibility || "N/A"
                } | Job Roles: ${c.jobRoles || "N/A"}`
        )
        .join("\n");

    const faqsSummary = faqs
        .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
        .join("\n\n");

    const langInstruction =
        language && language !== "en"
            ? `IMPORTANT: The user prefers to communicate in language code "${language}". Always reply in that language.`
            : "";

    return `You are EduBot, an intelligent 24×7 AI counselor and admission support assistant for Eduroutez – India's trusted education discovery platform.

${langInstruction}

## Your Role
- Help students with: admission guidance, course selection, institute comparisons, career counselling, eligibility queries, fee structures, scholarship info, exam requirements, and general education advice.
- Be warm, encouraging, and concise. Use bullet points when listing options.
- If you don't know an exact answer, guide the user to contact the institute directly or visit eduroutez.com.
- Never make up data. Only use the context below.

---
## INSTITUTES ON EDUROUTEZ (Live Data)
${institutesSummary || "No institutes available right now."}

---
## COURSES AVAILABLE
${coursesSummary || "No courses available right now."}

---
## CAREER PATHS
${careersSummary || "No careers available right now."}

---
## FAQs
${faqsSummary || "No FAQs available right now."}

---
When a user asks about a specific institute/course, use the relevant data above.
If the user's question is outside education scope, politely redirect them to education topics.
Today's date: ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`;
}

// ─────────────────────────────────────────────
//  Public service functions
// ─────────────────────────────────────────────

/**
 * Start or continue a chat session.
 */
export async function chat({ sessionId, message, language = "en", userId = null }) {
    // 1. Load or create session
    let session = null;
    if (sessionId) {
        session = await ChatSession.findOne({ sessionId });
    }
    if (!session) {
        session = new ChatSession({
            sessionId: sessionId || uuidv4(),
            userId: userId || null,
            language,
            messages: [],
        });
    }

    // 2. Build context from live DB
    const context = await buildContext(message);
    const systemPrompt = buildSystemPrompt(context, language || session.language);

    // 3. Assemble OpenAI messages: system + last 10 turns + new user message
    const historySlice = session.messages.slice(-20); // last 10 turns (20 messages)
    const openAiMessages = [
        { role: "system", content: systemPrompt },
        ...historySlice.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
    ];

    // 4. Call OpenAI
    const assistantReply = await callOpenAI(openAiMessages);

    // 5. Persist messages
    session.messages.push({ role: "user", content: message });
    session.messages.push({ role: "assistant", content: assistantReply });
    session.lastActivity = new Date();
    session.language = language || session.language;
    if (userId) session.userId = userId;

    await session.save();

    return {
        sessionId: session.sessionId,
        reply: assistantReply,
        language: session.language,
    };
}

/**
 * Fetch chat history for a session.
 */
export async function getHistory(sessionId) {
    const session = await ChatSession.findOne({ sessionId }).lean();
    if (!session) return { messages: [], sessionId };
    return {
        sessionId: session.sessionId,
        language: session.language,
        messages: session.messages,
    };
}

/**
 * Clear / delete a chat session.
 */
export async function clearSession(sessionId) {
    await ChatSession.deleteOne({ sessionId });
    return { success: true };
}

/**
 * List all sessions (admin).
 */
export async function listSessions({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
        ChatSession.find()
            .select("sessionId userId language lastActivity messages")
            .sort({ lastActivity: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ChatSession.countDocuments(),
    ]);
    return { sessions, total, page, limit };
}
