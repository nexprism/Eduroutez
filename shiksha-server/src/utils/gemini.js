import { ServerConfig } from "../config/index.js";

/**
 * Thin wrapper around the Gemini generateContent API (no extra dependency).
 * Returns the raw text response, or null on any failure so callers can fall back gracefully.
 */
export async function callGemini({
  systemInstruction,
  prompt,
  temperature = 0.7,
  maxTokens = 1500,
}) {
  const apiKey = ServerConfig.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = ServerConfig.GEMINI_MODEL || "gemini-1.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : null;
  } catch (error) {
    console.error("callGemini error:", error.message);
    return null;
  }
}

/** Strip markdown fences and parse JSON safely. */
export function parseJsonFromGemini(text) {
  if (!text) return null;
  try {
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
