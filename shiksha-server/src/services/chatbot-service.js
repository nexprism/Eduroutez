import { ServerConfig } from "../config/index.js";
import Institute from "../models/Institute.js";
import Course from "../models/Course.js";
import Career from "../models/Career.js";
import ChatSession from "../models/ChatSession.js";
import FAQ from "../models/FAQ.js";
import Assessment from "../models/Assessment.js";
import AssessmentService from "./assessment-service.js";
import { v4 as uuidv4 } from "uuid";

const ASSESSMENT_DIMENSIONS = [
    "Analytical",
    "Creative",
    "Social",
    "Leadership",
    "Practical",
    "Conventional",
];

const assessmentService = new AssessmentService();

// ─────────────────────────────────────────────
//  Gemini helper  (uses fetch – no extra pkg)
// ─────────────────────────────────────────────
async function callGemini(systemInstruction, contents, options = {}) {
    const apiKey = ServerConfig.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key not configured");

    const model = ServerConfig.GEMINI_MODEL || "gemini-3.1-flash-lite";

    const body = {
        system_instruction: {
            parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.max_tokens || 800,
        },
    };

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error("Gemini returned empty response");
    }
    return text.trim();
}

// ─────────────────────────────────────────────
//  Personality-to-College Fit Assessment flow
// ─────────────────────────────────────────────
function shouldStartAssessment(text) {
    const t = text.toLowerCase();
    const triggers = [
        "personality",
        "fit assessment",
        "fit test",
        "which college suits",
        "suitable college",
        "college fit",
        "career fit",
        "personality test",
        "start the assessment",
        "start assessment",
        "match me with",
        "match me to",
    ];
    return triggers.some((tr) => t.includes(tr));
}

function formatOptions(question) {
    return question.options
        .map((opt, i) => `${i + 1}. ${opt.text}`)
        .join("\n");
}

// Map a free-text user reply to an option index. Returns -1 if ambiguous.
function classifyAnswer(question, text) {
    const t = text.trim().toLowerCase();

    const numMatch = t.match(/\b([1-9])\b/);
    if (numMatch) {
        const idx = parseInt(numMatch[1], 10) - 1;
        if (idx >= 0 && idx < question.options.length) return idx;
    }

    let best = -1;
    let bestScore = 0;
    question.options.forEach((opt, i) => {
        const words = opt.text
            .toLowerCase()
            .split(/\W+/)
            .filter((w) => w.length > 3);
        let score = 0;
        words.forEach((w) => {
            if (t.includes(w)) score += 1;
        });
        if (score > bestScore) {
            bestScore = score;
            best = i;
        }
    });
    return bestScore > 0 ? best : -1;
}

function formatResult(result) {
    const profile = Object.fromEntries(result.profile);
    const profileLine = ASSESSMENT_DIMENSIONS.map(
        (d) => `${d}: ${profile[d] || 0}%`
    ).join("   ");

    let reply =
        "🎉 Assessment complete! Here is your personality profile:\n\n" +
        profileLine +
        `\n\nYour dominant traits: ${
            result.dominantDimensions.join(", ") || "N/A"
        }.\n\n` +
        "🏫 Top college matches for you (based on campus-culture & stream fit):\n";

    result.topInstitutes.slice(0, 5).forEach((inst, i) => {
        const location = [inst.city, inst.state].filter(Boolean).join(", ");
        reply +=
            `\n${i + 1}. ${inst.instituteName}` +
            (location ? ` — ${location}` : "") +
            `\n   Fit Score: ${inst.fitScore}%` +
            (inst.matchedDimensions?.length
                ? ` | Matched: ${inst.matchedDimensions.join(", ")}`
                : "") +
            "\n";
    });

    reply +=
        "\nWould you like admission guidance or details on any of these colleges? 🙂";
    return reply;
}

async function startAssessment(session, language) {
    const assessment = await assessmentService.ensureDefaultAssessment();
    session.assessment = {
        active: true,
        assessmentId: assessment._id,
        currentIndex: 0,
        answers: [],
        resultId: null,
    };
    const q = assessment.questions[0];
    const reply =
        "Great choice! 🎓 Let's find colleges that match your personality and campus-culture fit.\n\n" +
        `I will ask you ${assessment.questions.length} quick questions — there are no wrong answers!\n\n` +
        `Question 1 of ${assessment.questions.length}:\n${q.questionText}\n\n` +
        formatOptions(q) +
        "\n\nReply with the number of your choice (or type your answer).";
    return reply;
}

async function handleAssessmentAnswer(session, message) {
    const assessment = await Assessment.findById(
        session.assessment.assessmentId
    ).lean();
    if (!assessment) {
        session.assessment.active = false;
        return "Sorry, that assessment is no longer available. How else can I help?";
    }

    const t = message.trim().toLowerCase();
    if (/\b(cancel|stop|exit|quit|end)\b/.test(t)) {
        session.assessment.active = false;
        return "No problem! I've cancelled the assessment. Ask me anything else about courses or colleges. 🙂";
    }

    const idx = session.assessment.currentIndex;
    const question = assessment.questions[idx];
    const chosen = classifyAnswer(question, message);

    if (chosen === -1) {
        return (
            "I didn't catch that — please reply with a number " +
            `(1-${question.options.length}) for your choice:\n\n` +
            formatOptions(question)
        );
    }

    const option = question.options[chosen];
    session.assessment.answers.push({
        questionId: question._id,
        selectedOptionIndex: chosen,
        dimension: option.dimension,
    });
    session.assessment.currentIndex += 1;

    const nextIdx = session.assessment.currentIndex;
    if (nextIdx < assessment.questions.length) {
        const nextQ = assessment.questions[nextIdx];
        return (
            "✅ Noted!\n\n" +
            `Question ${nextIdx + 1} of ${assessment.questions.length}:\n` +
            `${nextQ.questionText}\n\n` +
            formatOptions(nextQ) +
            "\n\nReply with the number of your choice."
        );
    }

    // All answered → compute result
    session.assessment.active = false;
    const result = await assessmentService.submit({
        assessmentId: assessment._id,
        userId: session.userId,
        answers: session.assessment.answers,
    });
    session.assessment.resultId = result._id;
    return formatResult(result);
}

// ─────────────────────────────────────────────
//  Context builder – pulls live DB data
// ─────────────────────────────────────────────
async function buildContext(userMessage) {
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
        .lean();

    const courses = await Course.find({ isActive: true, deletedAt: null })
        .select(
            "courseTitle courseType courseLevel shortDescription eligibility " +
            "courseFee courseDurationYears courseDurationMonths examAccepted " +
            "courseOpportunities category language slug"
        )
        .populate("courseCreatedBy", "instituteName")
        .lean();

    const careers = await Career.find({ isActive: true, deletedAt: null })
        .select("title description category eligibility jobRoles opportunity topColleges")
        .lean();

    const faqs = await FAQ.find({ deletedAt: null })
        .select("question answer")
        .lean();

    return { institutes, courses, careers, faqs };
}

// ─────────────────────────────────────────────
//  System prompt builder
// ─────────────────────────────────────────────
function buildSystemPrompt({ institutes, courses, careers, faqs }, language) {
    const getCity = (i) => {
        if (!i.city) return "";
        return typeof i.city === "string" ? i.city : i.city.name || "";
    };
    const getState = (i) => {
        if (!i.state) return "";
        return typeof i.state === "string" ? i.state : i.state.name || "";
    };
    const institutesSummary = institutes
        .map(
            (i) =>
                `• ${i.instituteName} (${i.organization || "Institute"}) – ${getCity(i)
                }, ${getState(i)} | Fees: ${i.minFees || "?"}-${i.maxFees || "?"
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

    const firstLine = language === "hi"
        ? `[LANGUAGE RULE: ALWAYS match the user's language. If they write in Urdu, reply in Urdu. If they write in Punjabi, reply in Punjabi. If they write in English, reply in English. ONLY use Hindi when the user writes in Hindi. Never force Hindi if the user is using another language.]`
        : `[LANGUAGE RULE: ALWAYS match the user's language. If they write in Hindi, reply in Hindi. If they write in Urdu, reply in Urdu. If they write in Punjabi, reply in Punjabi. ONLY use English when the user writes in English. Never force English if the user is using another language.]`;

    const lastLine = `[REMINDER: ALWAYS match the user's language. Do NOT force ${language === "hi" ? "Hindi" : "English"} if the user wrote in a different language.]`;

    return `${firstLine}

You are EduBot, an intelligent AI education counselor and admission assistant for Eduroutez — India's trusted education discovery platform.

## Your Role
- Help students make better education decisions by providing accurate guidance about: colleges and universities, courses and programs, admission processes, eligibility criteria, entrance exams, fees and scholarships, career paths, institute comparisons, and skill development opportunities.
- Be friendly, professional, and supportive. Communicate like an experienced education counselor.
- Keep answers simple and easy for students to understand.
- Use bullet points and tables when comparing options.
- Ask follow-up questions when student requirements are unclear.

## Important Rules
1. Never create fake information.
2. Only provide institute, course, fee, admission, and career information from the provided database context below.
3. If information is not available, clearly say: "I don't have this information currently. Please contact the institute or Eduroutez support team for updated details."
4. Do not guess rankings, fees, admission dates, placements, or eligibility.
5. Do not provide unrelated answers. Politely bring conversations back to education.
6. Always prioritize student guidance and clarity.
7. CRITICAL: Never claim data is limited to specific cities or states. The database below contains ALL available institutes. If a user asks about a location, check the list carefully before saying data is unavailable. Do NOT invent location-based restrictions.
8. CRITICAL: Do not say "My current data covers specific regions in..." or similar qualifying statements about geographic coverage. The data below is the complete set. Answer based on what IS in the list, not what you think is missing.

## Student Assistance Flow
- When a student asks about courses: Understand their interests. Ask about education qualification, preferred field, budget, location preference, and career goals. Then suggest suitable options.
- When a student asks about colleges: Provide institute name, location, available courses, eligibility, fees (if available), admission information, facilities, and relevant exams.
- When comparing colleges: Create a comparison table based only on available data.

## Language Support
ALWAYS match the user's language. Support ALL languages: Urdu, Punjabi, Hindi, English, Tamil, Telugu, Marathi, Gujarati, Bengali, Kannada, Malayalam, etc. Never reply in a language different from what the user wrote. The selected language (Hindi/English) is only a fallback when you cannot detect the user's language.

## Personality-to-College Fit Assessment
You can offer students a free "Personality-to-College Fit Assessment" — a short psychometric test that matches them with suitable colleges and campus culture. Offer it whenever a student asks which college/course suits them, or about personality/career fit. If a student wants to start it, respond warmly and the system will guide them through the questions automatically. Do NOT invent assessment scores or college matches yourself — the system computes them from the student's answers.

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
${lastLine}

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

    // 2. Route assessment flow if active or triggered
    const userText = message.trim();
    let assistantReply;
    if (session.assessment && session.assessment.active) {
        assistantReply = await handleAssessmentAnswer(session, userText);
    } else if (shouldStartAssessment(userText)) {
        assistantReply = await startAssessment(session, language || session.language);
    } else {
        // 3. Build context from live DB + call Gemini
        const context = await buildContext(userText);
        const systemPrompt = buildSystemPrompt(context, language || session.language);

        const historySlice = session.messages.slice(-20); // last 10 turns (20 messages)
        const geminiContents = historySlice.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));
        geminiContents.push({
            role: "user",
            parts: [{ text: userText }],
        });

        assistantReply = await callGemini(systemPrompt, geminiContents);
    }

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
