import Career from "../models/Career.js";
import { callGemini, parseJsonFromGemini } from "../utils/gemini.js";

const SYSTEM_INSTRUCTION = `You are an Indian higher-education and career-outcomes analyst with deep knowledge of the 2025-2026 Indian job market. You predict realistic career outcomes for students. You are precise, specific with salary figures (in ₹ LPA), and never invent exact institute or company names you are unsure about. Always respond with ONLY valid JSON, no markdown and no code fences.`;

/**
 * AI Career Outcome Predictor
 * Inputs : a career (free text) and/or a careerId (fetched from DB), plus
 *          optional educationLevel, location and skills.
 * Output : structured prediction — salary range, placement chances,
 *          career growth, higher-study opportunities, top recruiters, summary.
 */
export async function predictCareerOutcome({
  career,
  careerId,
  educationLevel,
  location,
  skills,
} = {}) {
  // Enrich context from the existing Career catalogue when an id is provided.
  let careerContext = career || "";
  if (careerId) {
    try {
      const found = await Career.findById(careerId).lean();
      if (found) {
        careerContext = [
          found.title,
          found.description,
          found.jobRoles,
          found.opportunity,
          found.topColleges,
        ]
          .filter(Boolean)
          .join("\n");
      }
    } catch (err) {
      console.error("careerOutcome: career lookup failed", err.message);
    }
  }

  const inputSummary = [
    careerContext && `Career / Field:\n${careerContext}`,
    educationLevel && `Education Level: ${educationLevel}`,
    location && `Preferred Location: ${location}`,
    skills && `Student Skills / Interests: ${skills}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = `Analyze the likely career outcome for the following student profile and return your prediction as JSON.

${inputSummary}

Return ONLY valid JSON (no markdown, no code fences) with exactly this structure:
{
  "career": "Career / Field name",
  "salaryRange": {
    "entryLevel": "₹X - ₹Y LPA",
    "midLevel": "₹X - ₹Y LPA",
    "seniorLevel": "₹X - ₹Y LPA",
    "note": "short note about the salary band"
  },
  "placementChances": {
    "rating": "High" | "Medium" | "Low",
    "percentage": 0-100,
    "note": "short note explaining placement likelihood"
  },
  "careerGrowth": {
    "outlook": "Positive" | "Stable" | "Moderate",
    "timeline": [
      { "year": "0-2 yrs", "level": "Entry", "remark": "..." },
      { "year": "3-5 yrs", "level": "Mid", "remark": "..." },
      { "year": "6-10 yrs", "level": "Senior", "remark": "..." }
    ],
    "note": "short note on long-term growth"
  },
  "higherStudy": [
    { "option": "M.Tech", "description": "...", "value": "High" | "Medium" | "Low" }
  ],
  "topRecruiters": ["Company1", "Company2", "Company3"],
  "summary": "2-3 sentence overall outlook for this career path"
}

Base the figures on realistic 2025-2026 Indian market trends. Be specific and avoid vague statements.`;

  const text = await callGemini({
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    temperature: 0.5,
    maxTokens: 2000,
  });

  const parsed = parseJsonFromGemini(text);
  if (parsed && parsed.salaryRange) {
    return { ...parsed, source: "ai" };
  }

  // Graceful fallback so the UI still renders if Gemini is unconfigured / fails.
  return fallbackOutcome({ career: career || "Selected career", educationLevel, location });
}

function fallbackOutcome({ career, educationLevel, location }) {
  return {
    career,
    salaryRange: {
      entryLevel: "₹3 - ₹6 LPA",
      midLevel: "₹6 - ₹12 LPA",
      seniorLevel: "₹12 - ₹25 LPA",
      note: "Estimated using a generic Indian-market band (AI analysis unavailable).",
    },
    placementChances: {
      rating: "Medium",
      percentage: 60,
      note: "Typical campus/Off-campus placement likelihood for this level.",
    },
    careerGrowth: {
      outlook: "Positive",
      timeline: [
        { year: "0-2 yrs", level: "Entry", remark: "Join as trainee / junior executive." },
        { year: "3-5 yrs", level: "Mid", remark: "Progress to executive / specialist role." },
        { year: "6-10 yrs", level: "Senior", remark: "Move into lead / managerial positions." },
      ],
      note: "General growth curve; refine with the AI predictor once configured.",
    },
    higherStudy: [
      { option: "Master's / PG", description: "Deepen specialization and improve prospects.", value: "Medium" },
      { option: "Certifications", description: "Short professional certifications add value.", value: "High" },
    ],
    topRecruiters: ["Top Indian & MNC firms (varies by field)"],
    summary: `Career outlook for "${career}"${location ? ` in ${location}` : ""} looks stable. Configure the Gemini API key for an AI-generated, data-driven prediction.`,
    source: "fallback",
  };
}
