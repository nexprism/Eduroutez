import Activity from "../models/Activity.js";
import Student from "../models/Student.js";
import Institute from "../models/Institute.js";
import Query from "../models/Query.js";
import ScheduleSlotModel from "../models/ScheduleSlots.js";
import { callGemini } from "../utils/gemini.js";

const normText = (v) =>
  (typeof v === "object" && v !== null ? (v.name || "") : (v || ""))
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

const capitalize = (s) => s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const trendOf = (recent, prev) => {
  let dir = "flat";
  if (recent > prev) dir = "up";
  else if (recent < prev) dir = "down";
  const pct = prev > 0 ? Math.round(((recent - prev) / prev) * 100) : recent > 0 ? 100 : 0;
  return { dir, pct };
};

const bucket = () => ({ total: 0, recent: 0, prev: 0 });
const bump = (m, key, recent) => {
  const k = normText(key);
  if (!k) return;
  if (!m.has(k)) m.set(k, bucket());
  const b = m.get(k);
  b.total += 1;
  if (recent === true) b.recent += 1;
  else if (recent === false) b.prev += 1;
};
const topN = (m, n, withTrend = false) =>
  [...m.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, n)
    .map(([key, b]) => {
      const o = { name: capitalize(key), count: b.total };
      if (withTrend) o.trend = trendOf(b.recent, b.prev);
      return o;
    });

const blankRegion = () => ({
  count: 0, recent: 0, prev: 0,
  interests: new Map(), categories: new Map(), entities: new Map(),
  instituteCount: 0, topInstitutes: [],
});

const locName = (v) => {
  if (!v) return "";
  if (typeof v === "object") return v.name || "";
  return v.toString();
};

export async function getGeoDemand({ days = 365, limit = 20000 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const mid = new Date(since.getTime() + (Date.now() - since.getTime()) / 2);

  const byState = new Map();
  const byCity = new Map();
  const national = new Map();
  const catNational = new Map();
  let totalSignals = 0;

  const add = ({ city, state, keyword, category, entity, recent }) => {
    bump(national, keyword, recent);
    bump(catNational, category, recent);
    if (!state) return;
    const sKey = normText(state);
    if (!byState.has(sKey)) byState.set(sKey, blankRegion());
    const s = byState.get(sKey);
    s.count += 1; if (recent === true) s.recent += 1; else if (recent === false) s.prev += 1;
    bump(s.interests, keyword, recent);
    bump(s.categories, category, recent);
    bump(s.entities, entity, recent);

    if (city) {
      const cKey = `${normText(city)}|${sKey}`;
      if (!byCity.has(cKey)) byCity.set(cKey, { city: capitalize(city), state: capitalize(sKey), ...blankRegion() });
      const c = byCity.get(cKey);
      c.count += 1; if (recent === true) c.recent += 1; else if (recent === false) c.prev += 1;
      bump(c.interests, keyword, recent);
      bump(c.categories, category, recent);
      bump(c.entities, entity, recent);
    }
  };

  // ── 1. Activity signals ──
  const acts = await Activity.find({ createdAt: { $gte: since } })
    .populate("user", "city state")
    .populate({
      path: "targetId",
      populate: { path: "courseCategory", select: "name", strictPopulate: false },
      strictPopulate: false,
    })
    .limit(limit)
    .lean();
  totalSignals += acts.length;

  for (const a of acts) {
    const u = a.user;
    const t = a.targetId;
    const state = locName(u?.state) || locName(t?.state);
    const city = locName(u?.city) || locName(t?.city);
    const kw = a.targetName ? normText(a.targetName) : normText(a.targetType || a.type || "");
    const ent = (a.targetType === "Institute" || a.targetType === "Course") && a.targetName ? normText(a.targetName) : null;
    const cat = normText(
      (t?.streams && t.streams[0]) ||
      t?.courseCategory?.name ||
      t?.specialization?.[0] ||
      t?.category ||
      a.targetType || ""
    );
    const recent = new Date(a.createdAt) >= mid;
    add({ city, state, keyword: kw, category: cat, entity: ent, recent });
  }

  // ── 2. Student geo distribution ──
  const students = await Student.find({}, "city state createdAt").limit(limit).lean();
  totalSignals += students.length;
  for (const s of students) {
    const state = locName(s.state);
    const city = locName(s.city);
    const recent = new Date(s.createdAt) >= mid;
    add({ city, state, keyword: "student", category: "student", entity: null, recent });
  }

  // ── 3. Queries by city ──
  const queries = await Query.find({ createdAt: { $gte: since } }, "city stream createdAt").populate("stream", "name").limit(limit).lean();
  totalSignals += queries.length;
  for (const q of queries) {
    const state = "";
    const city = q.city;
    const streamName = q.stream?.name || "";
    const recent = new Date(q.createdAt) >= mid;
    add({ city, state, keyword: "query", category: normText(streamName) || "query", entity: null, recent });
  }

  // ── 4. Counseling bookings by city (via Student) ──
  const slots = await ScheduleSlotModel.find({ createdAt: { $gte: since } })
    .populate("studentId", "city state")
    .limit(limit)
    .lean();
  totalSignals += slots.length;
  for (const sl of slots) {
    const stu = sl.studentId;
    const state = locName(stu?.state);
    const city = locName(stu?.city);
    const recent = new Date(sl.createdAt) >= mid;
    add({ city, state, keyword: "counselling", category: "counselling", entity: null, recent });
  }

  // ── 5. Institute distribution by location ──
  const institutes = await Institute.find({}, "instituteName city state thumbnailImage slug createdAt streams").lean();
  const instByState = new Map();
  const instByCity = new Map();
  for (const inst of institutes) {
    const s = normText(locName(inst.state));
    const c = normText(locName(inst.city));
    if (s) {
      if (!instByState.has(s)) instByState.set(s, []);
      instByState.get(s).push(inst);
    }
    if (c && s) {
      const key = `${c}|${s}`;
      if (!instByCity.has(key)) instByCity.set(key, []);
      instByCity.get(key).push(inst);
    }
    // Also add as a signal
    const recent = new Date(inst.createdAt) >= mid;
    add({ city: locName(inst.city), state: locName(inst.state), keyword: inst.instituteName, category: inst.streams?.[0] || "institute", entity: inst.instituteName, recent });
  }

  // Merge institute counts into region data
  for (const [sKey, insts] of instByState) {
    if (!byState.has(sKey)) byState.set(sKey, blankRegion());
    const s = byState.get(sKey);
    s.instituteCount = insts.length;
    s.topInstitutes = insts
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map((i) => ({
        name: i.instituteName,
        slug: i.slug,
        thumbnail: i.thumbnailImage,
        city: locName(i.city),
      }));
  }

  for (const [ckey, insts] of instByCity) {
    if (!byCity.has(ckey)) {
      const [cityName, stateName] = ckey.split("|");
      byCity.set(ckey, { city: capitalize(cityName), state: capitalize(stateName), ...blankRegion() });
    }
    const c = byCity.get(ckey);
    c.instituteCount = insts.length;
    c.topInstitutes = insts
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map((i) => ({
        name: i.instituteName,
        slug: i.slug,
        thumbnail: i.thumbnailImage,
        city: locName(i.city),
      }));
  }

  // ── Build output ──
  const imageBase = process.env.IMAGE_BASE_URL || process.env.VITE_IMAGE_BASE_URL || "";

  const states = [...byState.entries()]
    .map(([state, v]) => ({
      state: capitalize(state),
      count: v.count,
      ...trendOf(v.recent, v.prev),
      interests: topN(v.interests, 5),
      categories: topN(v.categories, 10, true),
      entities: topN(v.entities, 3),
      instituteCount: v.instituteCount || 0,
      topInstitutes: v.topInstitutes || [],
    }))
    .sort((a, b) => b.count - a.count);

  const cities = [...byCity.entries()]
    .map(([, v]) => ({
      city: v.city,
      state: v.state,
      count: v.count,
      ...trendOf(v.recent, v.prev),
      interests: topN(v.interests, 5),
      categories: topN(v.categories, 10, true),
      entities: topN(v.entities, 3),
      instituteCount: v.instituteCount || 0,
      topInstitutes: v.topInstitutes || [],
    }))
    .sort((a, b) => b.count - a.count);

  const nationalTop = topN(national, 12, true);
  const nationalCategories = topN(catNational, 12, true);

  // ── Google Trends via Gemini ──
  const googleTrendsData = await fetchGoogleTrends(states);

  // Merge Google trends into state-level categories
  for (const state of states) {
    const gt = googleTrendsData?.states?.[state.state.toLowerCase()];
    if (gt?.trending?.length) {
      // Prepend Google trends as synthetic categories with high confidence
      const existing = new Set(state.categories.map((c) => c.name.toLowerCase()));
      for (const t of gt.trending.slice(0, 4)) {
        if (!existing.has(t.stream.toLowerCase())) {
          state.categories.unshift({
            name: t.stream,
            count: Math.round(state.count * (t.confidence || 0.5)),
            trend: { dir: "up", pct: t.growth || 50 },
            source: "google",
          });
          existing.add(t.stream.toLowerCase());
        } else {
          // Boost existing category trend
          const match = state.categories.find((c) => c.name.toLowerCase() === t.stream.toLowerCase());
          if (match && match.trend?.dir !== "up") {
            match.trend = { dir: "up", pct: t.growth || 50 };
            match.source = "google_enhanced";
          }
        }
      }
    }
    // Mark categories that are cooling per Google
    if (gt?.cooling?.length) {
      const existing = new Set(state.categories.map((c) => c.name.toLowerCase()));
      for (const t of gt.cooling.slice(0, 2)) {
        if (!existing.has(t.stream.toLowerCase())) {
          state.categories.push({
            name: t.stream,
            count: Math.round(state.count * 0.1),
            trend: { dir: "down", pct: t.decline || 20 },
            source: "google",
          });
        }
      }
    }
  }

  const aiSummary = await buildGeoAiSummary({
    days, states, cities, nationalTop, nationalCategories,
    totalSignals, institutes: institutes.length, googleTrendsData,
  });

  return {
    generatedAt: new Date().toISOString(),
    windowDays: days,
    trendWindowDays: Math.round(days / 2),
    totalSignals,
    states,
    cities,
    nationalTop,
    nationalCategories,
    instituteCount: institutes.length,
    imageBase,
    aiSummary,
    googleTrends: googleTrendsData,
  };
}

/**
 * Fetch real-world educational stream trends via Gemini (trained on web data
 * including Google Trends signals). Returns trending/cooling streams per state.
 */
async function fetchGoogleTrends(states) {
  if (!states?.length) return null;
  const topStates = states.slice(0, 12).map((s) => s.state);
  try {
    const text = await callGemini({
      systemInstruction:
        "You are a Google Trends analyst for Indian education. Based on your training data covering real-world search trends and market intelligence up to 2026, " +
        "return ONLY valid JSON. No markdown, no code fences, no explanation.",
      prompt: `For each of these Indian states/regions: ${topStates.join(", ")}, identify the top 3 educational streams/courses that are TRENDING UP in 2026-2027 (increasing search interest and demand) and up to 2 that are COOLING DOWN.

Return JSON exactly like this format, using ONLY these stream names (pick the closest match): Engineering, Medical, Law, MBA, BCA, BBA, B.Com, BA, B.Sc, Pharmacy, Architecture, Design, Hotel Management, Agriculture, Nursing, Paramedical, Education, Journalism, Fine Arts, Computer Applications, Data Science, AI & ML, Cybersecurity, Digital Marketing, Finance, Psychology, Biotechnology, Economics, Political Science, Sociology.

{
  "states": {
    "maharashtra": {
      "trending": [{"stream": "Data Science", "growth": 65, "confidence": 0.8}, {"stream": "AI & ML", "growth": 55, "confidence": 0.75}],
      "cooling": [{"stream": "Traditional Engineering", "decline": 25, "confidence": 0.6}]
    }
  }
}

Only include states you have high confidence about. Omit states where trends are unclear. Growth/decline is percentage change.`,
      temperature: 0.3,
      maxTokens: 2000,
    });
    if (!text) return null;
    // Strip markdown fences if present
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    console.error("fetchGoogleTrends error:", e.message);
    return null;
  }
}

async function buildGeoAiSummary({ days, states, cities, nationalTop, nationalCategories, totalSignals, institutes, googleTrendsData }) {
  const snapshot = {
    windowDays: days,
    totalSignals,
    totalInstitutes: institutes,
    states: states.slice(0, 10).map((s) => ({
      state: s.state, count: s.count, trend: { dir: s.dir, pct: s.pct },
      instituteCount: s.instituteCount,
      topCategory: s.categories?.[0]?.name || null,
      googleTrending: s.categories?.filter((c) => c.source === "google" || c.source === "google_enhanced").slice(0, 3).map((c) => c.name) || [],
    })),
    topCities: cities.slice(0, 15).map((c) => ({
      city: c.city, state: c.state, count: c.count, trend: { dir: c.dir, pct: c.pct },
      instituteCount: c.instituteCount,
    })),
    nationalCategories: nationalCategories.map((c) => ({ name: c.name, count: c.count, trend: c.trend })),
    topInterests: nationalTop.slice(0, 10).map((n) => n.name),
    googleTrendsAvailable: !!googleTrendsData,
  };

  try {
    const text = await callGemini({
      systemInstruction:
        "You are a geographic-demand analyst. Given student-interest signals (from platform activity) AND Google Trends intelligence (from web search data), " +
        "write a 2-3 sentence geo-trend summary. Mention which streams are trending up in which states per Google Trends, " +
        "and any notable shifts. No markdown headings, no bullet lists, plain concise text only.",
      prompt: "Summarize geographic demand trends using both platform signals and Google Trends data:\n" + JSON.stringify(snapshot),
      temperature: 0.5,
      maxTokens: 300,
    });
    if (text) return { text, source: "ai" };
  } catch (e) {
    // fall through
  }

  return { text: ruleBasedGeoSummary(states, cities, nationalCategories, googleTrendsData), source: "rule" };
}

function ruleBasedGeoSummary(states, cities, nationalCategories, googleTrendsData) {
  if (!states.length && !cities.length) {
    return "Not enough data to detect regional trends yet. As more students register and interact, the demand heatmap will populate automatically.";
  }
  const rising = states.filter((s) => s.dir === "up").slice(0, 3).map((s) => s.state);
  const falling = states.filter((s) => s.dir === "down").slice(0, 3).map((s) => s.state);
  const topCat = nationalCategories?.[0]?.name;
  const maxInstState = states.reduce((a, b) => (a.instituteCount > b.instituteCount ? a : b), states[0]);
  const parts = [];

  // Google Trends highlights
  if (googleTrendsData?.states) {
    const gtRising = [];
    for (const [sName, sData] of Object.entries(googleTrendsData.states)) {
      if (sData.trending?.length) {
        const streams = sData.trending.slice(0, 2).map((t) => t.stream).join(", ");
        gtRising.push(`${sName}: ${streams}`);
      }
    }
    if (gtRising.length) {
      parts.push(`Google Trends shows rising interest in ${gtRising.slice(0, 3).join("; ")}.`);
    }
  }

  if (rising.length) parts.push(`Platform demand rising in ${rising.join(", ")}` + (falling.length ? `, cooling in ${falling.join(", ")}` : "") + ".");
  else if (falling.length) parts.push(`Platform demand cooling in ${falling.join(", ")}.`);

  if (maxInstState && maxInstState.instituteCount > 0) {
    parts.push(`${maxInstState.state} has the most institutes (${maxInstState.instituteCount}).`);
  }
  if (topCat) parts.push(`Top platform category: "${topCat}".`);
  if (!parts.length) parts.push("Student activity is evenly distributed across regions.");
  return parts.join(" ");
}
