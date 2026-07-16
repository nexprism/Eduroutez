import Activity from "../models/Activity.js";
import { callGemini } from "../utils/gemini.js";

const normText = (v) =>
  (typeof v === "object" && v !== null ? (v.name || "") : (v || ""))
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

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
      const o = { name: key, count: b.total };
      if (withTrend) o.trend = trendOf(b.recent, b.prev);
      return o;
    });

const blankRegion = () => ({
  count: 0, recent: 0, prev: 0,
  interests: new Map(), categories: new Map(), entities: new Map(),
});

// Aggregate student-interest signals (Activity + Wishlist) by geo region,
// with richer breakdowns: top entities (colleges/courses), demand by
// category/stream, and recent-vs-previous period trend.
// city is used as the district level (no district field exists).
export async function getGeoDemand({ days = 365, limit = 20000 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const mid = new Date(since.getTime() + (Date.now() - since.getTime()) / 2);

  const byState = new Map();
  const byCity = new Map();
  const national = new Map(); // keyword -> bucket
  const catNational = new Map(); // category -> bucket
  let totalSignals = 0;
  let withGeo = 0;

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
      if (!byCity.has(cKey)) byCity.set(cKey, { city, state: sKey, ...blankRegion() });
      const c = byCity.get(cKey);
      c.count += 1; if (recent === true) c.recent += 1; else if (recent === false) c.prev += 1;
      bump(c.interests, keyword, recent);
      bump(c.categories, category, recent);
      bump(c.entities, entity, recent);
    }
  };

  // ── Activity signals (like / wishlist interactions) ──
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
    const state = u?.state?.name || t?.state?.name;
    const city = u?.city?.name || t?.city?.name;
    if (state) withGeo += 1;
    const kw = a.targetName ? normText(a.targetName) : normText(a.targetType || a.type || "");
    const ent = (a.targetType === "Institute" || a.targetType === "Course") ? (a.targetName ? normText(a.targetName) : null) : null;
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

  const states = [...byState.entries()]
    .map(([state, v]) => ({
      state,
      count: v.count,
      ...trendOf(v.recent, v.prev),
      interests: topN(v.interests, 5),
      categories: topN(v.categories, 4),
      entities: topN(v.entities, 3),
    }))
    .sort((a, b) => b.count - a.count);

  const cities = [...byCity.entries()]
    .map(([, v]) => ({
      city: v.city,
      state: v.state,
      count: v.count,
      ...trendOf(v.recent, v.prev),
      interests: topN(v.interests, 5),
      categories: topN(v.categories, 4),
      entities: topN(v.entities, 3),
    }))
    .sort((a, b) => b.count - a.count);

  const nationalTop = topN(national, 12, true);
  const nationalCategories = topN(catNational, 12, true);

  const aiSummary = await buildGeoAiSummary({
    days, states, cities, nationalTop, nationalCategories, withGeo,
  });

  return {
    generatedAt: new Date().toISOString(),
    windowDays: days,
    trendWindowDays: Math.round(days / 2),
    totalSignals,
    withGeo,
    states,
    cities,
    nationalTop,
    nationalCategories,
    aiSummary,
  };
}

// AI-generated trend narrative from the activity-based aggregates (wishlist is
// excluded from the trend by design). Falls back to a rule-based summary when
// no Gemini key is configured or the call fails.
async function buildGeoAiSummary({ days, states, cities, nationalTop, nationalCategories, withGeo }) {
  const snapshot = {
    windowDays: days,
    trendWindowDays: Math.round(days / 2),
    withGeo,
    states: states.map((s) => ({
      state: s.state,
      count: s.count,
      trend: { dir: s.dir, pct: s.pct },
      topCategory: s.categories?.[0]?.name || null,
    })),
    topCities: cities.slice(0, 15).map((c) => ({
      city: c.city, state: c.state, count: c.count, trend: { dir: c.dir, pct: c.pct },
    })),
    nationalCategories: nationalCategories.map((c) => ({ name: c.name, count: c.count, trend: c.trend })),
    topInterests: nationalTop.slice(0, 10).map((n) => n.name),
  };

  try {
    const text = await callGemini({
      systemInstruction:
        "You are a geographic-demand analyst. Given student-interest demand data broken down by geography, write a 2-3 sentence geo-trend summary. " +
        "State ONLY which states and cities are rising or cooling and by roughly how much. " +
        "Do NOT mention national categories, do NOT give recommendations. No markdown headings, no bullet lists, plain concise text only.",
      prompt: "Summarize only the GEOGRAPHIC demand trend from this snapshot (focus on state/city trends):\n" + JSON.stringify(snapshot),
      temperature: 0.5,
      maxTokens: 300,
    });
    if (text) return { text, source: "ai" };
  } catch (e) {
    // fall through to rule-based
  }

  return { text: ruleBasedGeoSummary(states, cities, nationalCategories), source: "rule" };
}

function ruleBasedGeoSummary(states, cities, nationalCategories) {
  if (!states.length && !cities.length) {
    return "Not enough geo-tagged student activity to detect a regional trend yet. Encourage students to complete their city/state profile so demand can be mapped.";
  }
  const rising = states.filter((s) => s.dir === "up").slice(0, 3).map((s) => s.state);
  const falling = states.filter((s) => s.dir === "down").slice(0, 3).map((s) => s.state);
  const topCat = nationalCategories?.[0]?.name;
  const parts = [];
  if (rising.length) parts.push(`Demand is rising in ${rising.join(", ")}` + (falling.length ? ` and cooling in ${falling.join(", ")}` : "") + ".");
  else if (falling.length) parts.push(`Demand is cooling in ${falling.join(", ")}.`);
  if (topCat) parts.push(`The dominant category/stream is "${topCat}".`);
  return parts.join(" ");
}
