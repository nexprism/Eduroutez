import { ServerConfig } from "../config/index.js";

async function getAIInsights() {
    const apiKey = ServerConfig.GEMINI_API_KEY;
    if (!apiKey) return null;

    const prompt = `You are an Indian education market analyst. Provide comprehensive insights about the CURRENT Indian education market.

Return your response as a JSON object (no markdown, no code fences, pure JSON only) with this exact structure:
{
  "highDemandCourses": [
    { "course": "Course Name", "demand": "High/Medium", "reason": "Brief reason for demand", "avgSalaryRange": "₹X - ₹Y LPA", "growthOutlook": "Positive/Stable" }
  ],
  "emergingFields": [
    { "field": "Field Name", "whyEmerging": "Brief explanation", "keySkills": ["skill1", "skill2"], "careerPaths": ["path1", "path2"] }
  ],
  "salaryTrends": [
    { "role": "Job Role", "entryLevel": "₹X LPA", "midLevel": "₹X LPA", "seniorLevel": "₹X LPA", "growthRate": "X%" }
  ],
  "topInstitutesByStream": [
    { "stream": "Stream Name", "topInstitutes": ["Institute1", "Institute2"], "selectionCriteria": "Brief criteria" }
  ],
  "marketSummary": "2-3 sentence summary of the current Indian education market",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Cover these categories: Engineering, Medical, MBA, Computer Science/IT, Arts, Commerce, Law, Design, Hotel Management.
Base the data on REAL 2025-2026 market trends. Be specific with salary figures and institute names.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: "You are an Indian education market analyst. Return ONLY valid JSON. No markdown, no explanations." }] },
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.5, maxOutputTokens: 2000 },
                }),
            }
        );
        if (!response.ok) return null;
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) return null;
        const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        return JSON.parse(cleaned);
    } catch (_) {
        return null;
    }
}

export async function getTrends() {
    const aiInsights = await getAIInsights();
    return { aiInsights };
}

export async function askAI(question) {
    const apiKey = ServerConfig.GEMINI_API_KEY;
    if (!apiKey) return "AI analysis is not configured. Please set up your Gemini API key.";

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: "You are an Indian education market analyst. Answer questions about course demand, salary trends, college comparisons, career prospects, and market trends in India. Be specific with data and institute names. Keep answers concise but informative. Use bullet points where helpful. For course comparisons, give a clear verdict on which is better for different scenarios (salary, demand, scope, difficulty)." }]
                    },
                    contents: [{ role: "user", parts: [{ text: question }] }],
                    generationConfig: { temperature: 0.5, maxOutputTokens: 1000 },
                }),
            }
        );
        if (!response.ok) return "Sorry, I couldn't fetch the analysis right now.";
        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response generated.";
    } catch (_) {
        return "An error occurred while analyzing. Please try again.";
    }
}
