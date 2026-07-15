import Institute from "../models/Institute.js";
import Course from "../models/Course.js";
import Counselor from "../models/Counselor.js";
import Activity from "../models/Activity.js";
import Wishlist from "../models/Wishlist.js";
import Career from "../models/Career.js";
import { callGemini, parseJsonFromGemini } from "../utils/gemini.js";

// ──────────────────────────────────────────────────────────────────────────
//  Helpers (ported from the client-side engine in D:\eduroutez src/ApiFunctions/api.js)
//  so the backend returns the exact same shape the React Results component renders.
// ──────────────────────────────────────────────────────────────────────────

const normText = (title) =>
  (title || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

const normStr = (v) => (typeof v === "object" && v !== null ? (v.name || "") : (v || ""));

const getInstFee = (inst) => Number(inst.minFees || inst.minFee || 0);

const stripHtml = (html) =>
  (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const parseAllEligibility = (inst) => {
  const html = [inst.cutoff, inst.admissionInfo].filter(Boolean).join(" ");
  const text = stripHtml(html);
  if (!text) return { rules: [], raw: "" };

  const rules = [];

  const catPattern = /(general|sc|st|obc|pwd|ews|nri|management|allied|fee\s*waiver)\s*(?:category|quota|candidates)?[:\s]+(?:minimum\s+)?(?:marks\s+)?(?:of\s+)?(\d{1,3})\s*%/gi;
  let m;
  while ((m = catPattern.exec(text)) !== null) {
    rules.push({ type: "category_min", category: m[1].trim().toLowerCase(), value: parseInt(m[2]), text: m[0] });
  }

  const groupPattern = /\b(general|sc|st|obc|pwd|ews|nri)(?:\/(general|sc|st|obc|pwd|ews|nri))+\s*(?:category|quota|candidates)?[:\s]+(?:minimum\s+)?(?:marks\s+)?(?:of\s+)?(\d{1,3})\s*%/gi;
  while ((m = groupPattern.exec(text)) !== null) {
    const val = parseInt(m[m.length - 1]);
    const cats = [];
    for (let i = 1; i < m.length - 1; i++) {
      if (m[i] && !cats.includes(m[i].toLowerCase())) cats.push(m[i].toLowerCase());
    }
    for (const cat of cats) {
      const exists = rules.some((r) => r.type === "category_min" && r.category === cat && r.value === val);
      if (!exists) rules.push({ type: "category_min", category: cat, value: val, text: `${cat}: ${val}%` });
    }
  }

  const subjPattern = /(\d{1,3})\s*%\s*(?:in|for|aggregate\s+in)\s+((?:physics|chemistry|biology|biotechnology|mathematics|maths|pcb|pcm|english)[^.,\d]*(?:physics|chemistry|biology|biotechnology|mathematics|maths|pcb|pcm|english)?)/gi;
  while ((m = subjPattern.exec(text)) !== null) {
    rules.push({ type: "subject_min", subjects: m[2].trim().toLowerCase(), value: parseInt(m[1]), text: m[0] });
  }

  const genPatterns = [
    /(?:minimum|at least|required|should have|must have|eligibility|criteria)\s*(?:of|is|:)?\s*(\d{1,3})\s*%/gi,
    /(\d{1,3})\s*%\s*(?:aggregate|overall|marks|and above|& above|or above)/gi,
    /(\d{1,3})\s*%\s*(?:score|percentile|cutoff|cut.?off)/gi,
  ];
  for (const pat of genPatterns) {
    while ((m = pat.exec(text)) !== null) {
      const val = parseInt(m[1]);
      if (val >= 20 && val <= 100) {
        const nearby = text.slice(Math.max(0, m.index - 30), m.index + 60).toLowerCase();
        const hasCategory = /general|sc|st|obc|pwd|ews|nri/i.test(nearby);
        if (!hasCategory) rules.push({ type: "overall_min", value: val, text: m[0] });
      }
    }
  }

  const agePattern = /(?:age|years\s+old|years\s+of\s+age)\s*(?:limit|requirement|criteria)?[:\s]*(\d{1,2})\s*(?:years?|yrs?)/gi;
  while ((m = agePattern.exec(text)) !== null) rules.push({ type: "age", value: parseInt(m[1]), text: m[0] });
  const ageMinPattern = /(?:at\s+least|minimum|above)\s*(\d{1,2})\s*(?:years?|yrs?)/gi;
  while ((m = ageMinPattern.exec(text)) !== null) rules.push({ type: "age_min", value: parseInt(m[1]), text: m[0] });

  const subjects = ["physics", "chemistry", "biology", "biotechnology", "mathematics", "maths", "english"];
  const subjRequired = [];
  if (/\bpcb\b/i.test(text)) for (const s of ["physics", "chemistry", "biology"]) if (!subjRequired.includes(s)) subjRequired.push(s);
  if (/\bpcm\b/i.test(text)) for (const s of ["physics", "chemistry", "mathematics"]) if (!subjRequired.includes(s)) subjRequired.push(s);
  if (/(?:10\+2|10th|12th|higher\s*secondary|intermediate|hsc)\s*(?:with|in|passed|completed|qualified)/i.test(text)) {
    rules.push({ type: "qualification", text: "10+2 / Higher Secondary required" });
  }
  for (const s of subjects) {
    const re = new RegExp(`(?:must have|should have|with|including|compulsory|required|core)[^.]*?${s}`, "i");
    if (re.test(text)) subjRequired.push(s);
  }
  const subjListPattern = /(physics|chemistry|biology|biotechnology|mathematics|maths|english)(?:\s*[,/&]\s*(physics|chemistry|biology|biotechnology|mathematics|maths|english))+/gi;
  while ((m = subjListPattern.exec(text)) !== null) {
    const found = m[0].toLowerCase();
    for (const s of subjects) if (found.includes(s) && !subjRequired.includes(s)) subjRequired.push(s);
  }
  if (subjRequired.length) rules.push({ type: "subjects_required", subjects: subjRequired, text: subjRequired.join(", ") });

  if (/no\s*(?:tuition\s*)?fee|free|fee\s*waiver|exempt/i.test(text) && /sc|st|pwd/i.test(text)) {
    rules.push({ type: "fee_waiver_available", text: "Fee waiver for SC/ST/PwD" });
  }

  const aliasGroups = [
    { match: /sc\s*\/\s*st\s*\/?\s*obc/i, aliases: ["sc", "st", "obc"] },
    { match: /sc\s*\/\s*st/i, aliases: ["sc", "st"] },
    { match: /st\s*\/\s*obc/i, aliases: ["st", "obc"] },
    { match: /obc\s*\/\s*ews/i, aliases: ["obc", "ews"] },
  ];
  const hasGroup = aliasGroups.filter((g) => g.match.test(text));
  if (hasGroup.length) {
    for (const group of hasGroup) {
      for (const alias of group.aliases) {
        const source = rules.find((r) => r.type === "category_min" && group.aliases.includes(r.category) && r.category !== alias);
        if (source) {
          const exists = rules.some((r) => r.type === "category_min" && r.category === alias && r.value === source.value);
          if (!exists) rules.push({ type: "category_min", category: alias, value: source.value, text: `${alias}: ${source.value}%` });
        }
      }
    }
  }

  const seen = new Set();
  const unique = rules.filter((r) => {
    const key = `${r.type}|${r.value || r.subjects?.join(",") || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { rules: unique, raw: text };
};

const checkExamMatch = (inst, exam) => {
  if (!exam || !inst.examAccepted) return "unknown";
  const accepted = inst.examAccepted.split(",").map((e) => normText(e.trim()));
  const studentExam = normText(exam);
  const matched = accepted.some((e) => e.includes(studentExam) || studentExam.includes(e));
  return matched ? "accepted" : "unsure";
};

const checkEligibility = (inst, { exam, marks, category }) => {
  const result = {
    _eligible: true,
    _examMatch: "unknown",
    _minMarks: null,
    _eligibilityNote: null,
    _eligibilityRules: [],
  };

  result._examMatch = checkExamMatch(inst, exam);
  if (exam && result._examMatch === "accepted") {
    result._eligibilityRules.push({ type: "exam_accepted", text: `Accepts ${exam}` });
  } else if (exam && result._examMatch === "unsure") {
    result._eligibilityRules.push({ type: "exam_accepted", text: `Exam ${exam} not explicitly listed`, value: 0 });
  }

  const parsed = parseAllEligibility(inst);
  result._eligibilityRules = [...result._eligibilityRules, ...parsed.rules];

  const mVal = Number(marks);
  const cat = (category || "general").toLowerCase();
  const failures = [];

  for (const rule of parsed.rules) {
    if (rule.type === "category_min") {
      if (cat === rule.category || (cat === "general" && rule.category === "general")) {
        result._minMarks = rule.value;
        if (mVal && mVal < rule.value) failures.push(`${rule.category} requires ${rule.value}% (you have ${mVal}%)`);
      }
      if (rule.category === "general" && (!result._minMarks || rule.value < result._minMarks)) {
        result._minMarks = rule.value;
      }
    }
    if (rule.type === "overall_min") {
      if (!result._minMarks || rule.value < result._minMarks) result._minMarks = rule.value;
      if (mVal && mVal < rule.value) failures.push(`Minimum ${rule.value}% required (you have ${mVal}%)`);
    }
    if (rule.type === "subject_min") {
      if (mVal && mVal < rule.value) failures.push(`${rule.subjects}: ${rule.value}% required`);
    }
    if (rule.type === "subjects_required") {
      result._requiredSubjects = rule.subjects;
    }
  }

  if (!parsed.rules.length && mVal && mVal < 30) failures.push("Marks too low for most institutes");

  if (failures.length) {
    result._eligible = false;
    result._eligibilityNote = failures.join("; ");
  } else if (result._minMarks && mVal && mVal >= result._minMarks) {
    result._eligible = true;
    result._eligibilityNote = `Meets ${result._minMarks}% requirement`;
  }

  return result;
};

const classifyTier = (inst) => {
  let score = 0;
  if (inst.isBestRatedInstitute) score += 30;
  if (inst.isBestRatedUniversity) score += 30;
  if (inst.isBestRatedCollege) score += 25;
  if (inst.rating) score += Number(inst.rating) * 5;
  if (inst.rank) {
    const r = Number(inst.rank);
    if (r <= 10) score += 25;
    else if (r <= 50) score += 18;
    else if (r <= 100) score += 12;
    else if (r <= 500) score += 6;
    else score += 3;
  }
  if (inst.organisationType === "Central") score += 15;
  else if (inst.organisationType === "State") score += 10;
  else if (inst.organisationType === "Deemed") score += 8;
  else if (inst.organisationType === "Autonomous") score += 6;
  else if (inst.organisationType === "Aided") score += 4;
  if (inst.organization === "University") score += 10;
  else if (inst.organization === "College") score += 5;
  if (inst.establishedYear) {
    const age = new Date().getFullYear() - Number(inst.establishedYear);
    if (age >= 50) score += 10;
    else if (age >= 25) score += 7;
    else if (age >= 10) score += 4;
    else score += 2;
  }
  if (inst.examAccepted) {
    const exams = inst.examAccepted.split(",").filter(Boolean).length;
    score += Math.min(exams, 5);
  }
  if (inst.facilities && Array.isArray(inst.facilities)) {
    const fCount = inst.facilities.length;
    if (fCount >= 8) score += 10;
    else if (fCount >= 5) score += 7;
    else if (fCount >= 3) score += 4;
    else if (fCount >= 1) score += 2;
  }
  if (inst.gallery && Array.isArray(inst.gallery)) {
    const gCount = inst.gallery.length;
    if (gCount >= 10) score += 5;
    else if (gCount >= 5) score += 3;
    else score += 1;
  }
  if (inst.about && typeof inst.about === "string" && inst.about.length > 200) score += 5;
  if (inst.highestPackage) {
    const hp = Number(inst.highestPackage);
    if (hp >= 5000000) score += 10;
    else if (hp >= 1000000) score += 7;
    else if (hp >= 500000) score += 4;
    else score += 2;
  }
  if (inst.affiliation) score += 3;

  if (score >= 60) return { tier: "platinum", tierLabel: "Premium", tierScore: score };
  if (score >= 35) return { tier: "gold", tierLabel: "Standard", tierScore: score };
  if (score >= 18) return { tier: "silver", tierLabel: "Value", tierScore: score };
  return { tier: "bronze", tierLabel: "Accessible", tierScore: score };
};

const scoreInstitute = (inst, { marks, exam, preferredCourse, budget, state, city, category }, behavior) => {
  const tier = classifyTier(inst);
  let dims = { reputation: 0, affordability: 0, infrastructure: 0, location: 0 };

  const elig = checkEligibility(inst, { exam, marks, category });

  if (inst.isBestRatedInstitute || inst.isBestRatedUniversity || inst.isBestRatedCollege) dims.reputation += 30;
  if (inst.rating) dims.reputation += Math.min(Number(inst.rating) * 12, 30);
  if (inst.rank) {
    const r = Number(inst.rank);
    if (r <= 10) dims.reputation += 25;
    else if (r <= 50) dims.reputation += 18;
    else if (r <= 100) dims.reputation += 12;
    else dims.reputation += 5;
  }
  if (inst.organisationType === "Central" || inst.organisationType === "State") dims.reputation += 10;
  if (inst.organization === "University") dims.reputation += 5;
  if (inst.establishedYear) {
    const age = new Date().getFullYear() - Number(inst.establishedYear);
    dims.reputation += Math.min(age / 5, 10);
  }
  if (inst.affiliation) dims.reputation += 5;
  dims.reputation = Math.min(dims.reputation, 100);

  const b = Number(budget);
  if (b && getInstFee(inst) > 0) {
    const fee = getInstFee(inst);
    if (fee <= b) dims.affordability = 70 + Math.max(0, ((b - fee) / b) * 30);
    else if (fee <= b * 1.3) dims.affordability = 50 - ((fee - b) / (b * 0.3)) * 20;
    else if (fee <= b * 2) dims.affordability = 30 - ((fee - b * 1.3) / (b * 0.7)) * 20;
    else dims.affordability = Math.max(5, 30 - ((fee - b * 2) / (b * 5)) * 25);
  } else if (b && getInstFee(inst) === 0) {
    dims.affordability = 80;
  } else {
    dims.affordability = 50;
  }
  if (inst.scholarshipInfo) dims.affordability += 5;

  if (inst.facilities && Array.isArray(inst.facilities)) dims.infrastructure += Math.min(inst.facilities.length * 8, 40);
  if (inst.gallery && Array.isArray(inst.gallery)) dims.infrastructure += Math.min(inst.gallery.length * 3, 20);
  if (inst.library) dims.infrastructure += 10;
  if (inst.sports) dims.infrastructure += 8;
  if (inst.hostel) dims.infrastructure += 10;
  if (inst.about && inst.about.length > 100) dims.infrastructure += 7;
  if (inst.highestPackage) dims.infrastructure += 5;
  dims.infrastructure = Math.min(dims.infrastructure, 100);

  const instCity = normStr(inst.city);
  const instState = normStr(inst.state);
  if (city && instCity) {
    if (instCity.toLowerCase() === city.toLowerCase()) dims.location = 100;
    else if (instCity.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(instCity.toLowerCase())) dims.location = 75;
    else if (state && instState) dims.location = instState.toLowerCase() === state.toLowerCase() ? 55 : 20;
    else dims.location = 30;
  } else if (state && instState) {
    dims.location = instState.toLowerCase() === state.toLowerCase() ? 65 : 20;
  } else {
    dims.location = 30;
  }

  let courseMatch = 0;
  if (preferredCourse) {
    const pref = normText(preferredCourse);
    const prefWords = pref.split(/\s+/).filter((w) => w.length >= 3);
    const haystack = [inst.instituteName, inst.streams, inst.specialization, inst.courseTitle, inst.category].filter(Boolean).join(" ");
    const h = normText(haystack);
    if (h.includes(pref)) courseMatch = 28;
    else if (prefWords.some((w) => h.includes(w))) courseMatch = 14;
    else courseMatch = -14; // likely doesn't offer the preferred course
  }
  // Exam acceptance is a positive relevance signal beyond bare eligibility.
  if (exam && elig._examMatch === "accepted") courseMatch += 8;
  else if (exam && elig._examMatch === "unsure") courseMatch += 2;

  // ── Student behavior boost ──
  let behaviorMatch = false;
  let behaviorReason = null;
  if (behavior && behavior.length) {
    const hay = normText([inst.instituteName, inst.streams, inst.specialization, inst.courseTitle, inst.category, inst.organisationType].filter(Boolean).join(" "));
    const hit = behavior.find((kw) => kw && hay.includes(kw));
    if (hit) {
      behaviorMatch = true;
      behaviorReason = `Matches your interest in "${hit}"`;
      courseMatch += 12;
    }
  }

  // Return-on-investment: high placement package relative to fee is a strong signal.
  let roi = 0;
  const fee = getInstFee(inst);
  if (fee > 0 && inst.highestPackage) {
    const ratio = Number(inst.highestPackage) / fee;
    roi = Math.min(ratio * 4, 25);
  }

  const composite =
    dims.reputation * 0.32 +
    dims.affordability * 0.23 +
    dims.infrastructure * 0.20 +
    dims.location * 0.15 +
    courseMatch +
    roi;

  return {
    ...inst,
    _tier: tier.tier,
    _tierLabel: tier.tierLabel,
    _tierScore: tier.tierScore,
    _reputation: Math.round(dims.reputation),
    _affordability: Math.round(dims.affordability),
    _infrastructure: Math.round(dims.infrastructure),
    _location: Math.round(dims.location),
    _courseMatch: courseMatch,
    _score: Math.round(composite * 10) / 10,
    _eligible: elig._eligible,
    _examMatch: elig._examMatch,
    _minMarks: elig._minMarks,
    _eligibilityNote: elig._eligibilityNote,
    _eligibilityRules: elig._eligibilityRules,
    _requiredSubjects: elig._requiredSubjects,
    _behaviorMatch: behaviorMatch,
    _behaviorReason: behaviorReason,
  };
};

const scoreCourse = (course, { marks, preferredCourse, budget }, behavior) => {
  let score = 0;
  const m = Number(marks);
  if (m && course.cutOff) {
    const co = Number(course.cutOff);
    if (m >= co) score += 50;
    else score += Math.max(0, (m / co) * 20);
  } else score += 25;

  const budgetVal = Number(budget);
  if (budgetVal && course.coursePrice) {
    const p = Number(course.coursePrice);
    if (p <= budgetVal) score += 30;
    else score += Math.max(0, (budgetVal / p) * 10);
  } else score += 15;

  if (preferredCourse && course.courseTitle) {
    if (normText(course.courseTitle).includes(normText(preferredCourse))) score += 20;
  }

  let behaviorMatch = false;
  let behaviorReason = null;
  if (behavior && behavior.length) {
    const hay = normText([course.courseTitle, course.courseCategory, course.streams, course.specialization].filter(Boolean).join(" "));
    const hit = behavior.find((kw) => kw && hay.includes(kw));
    if (hit) {
      behaviorMatch = true;
      behaviorReason = `Matches your interest in "${hit}"`;
      score += 15;
    }
  }

  return { ...course, _score: Math.round(score), _eligible: true, _behaviorMatch: behaviorMatch, _behaviorReason: behaviorReason };
};

const scoreCounselor = (c, { state, city, preferredCourse }, behavior) => {
  let score = 0;
  const cCity = normStr(c.city);
  const cState = normStr(c.state);
  if (city && cCity && cCity.toLowerCase() === city.toLowerCase()) score += 40;
  else if (state && cState && cState.toLowerCase() === state.toLowerCase()) score += 25;
  if (preferredCourse && c.category && normText(c.category).includes(normText(preferredCourse))) score += 20;
  if (c.ExperienceYear) score += Math.min(Number(c.ExperienceYear), 20);

  let behaviorMatch = false;
  let behaviorReason = null;
  if (behavior && behavior.length) {
    const hay = normText([c.category, c.specialization, c.city, c.state].filter(Boolean).join(" "));
    const hit = behavior.find((kw) => kw && hay.includes(kw));
    if (hit) { behaviorMatch = true; behaviorReason = `Matches your interest in "${hit}"`; score += 10; }
  }

  return { ...c, _score: Math.round(score), _behaviorMatch: behaviorMatch, _behaviorReason: behaviorReason };
};

// ──────────────────────────────────────────────────────────────────────────
//  Student-behavior signals (Activity + Wishlist)
// ──────────────────────────────────────────────────────────────────────────

async function getBehaviorKeywords(userId) {
  const keywords = new Set();
  const pushText = (text) => {
    normText(text)
      .split(/\s+/)
      .filter((w) => w.length >= 3)
      .forEach((w) => keywords.add(w));
  };

  try {
    const wishlist = await Wishlist.findOne({ student: userId }).lean();
    if (wishlist?.colleges?.length) {
      const insts = await Institute.find({ _id: { $in: wishlist.colleges } }).lean();
      insts.forEach((i) => {
        pushText([i.instituteName, i.streams, i.specialization, i.courseTitle, i.category].filter(Boolean).join(" "));
      });
    }
    if (wishlist?.courses?.length) {
      const courses = await Course.find({ _id: { $in: wishlist.courses } }).lean();
      courses.forEach((c) => pushText([c.courseTitle, c.courseCategory, c.streams, c.specialization].filter(Boolean).join(" ")));
    }

    const acts = await Activity.find({
      user: userId,
      targetType: { $in: ["Institute", "Course", "Career"] },
    }).limit(50).lean();
    const idsByType = { Institute: [], Course: [], Career: [] };
    acts.forEach((a) => { if (a.targetId && idsByType[a.targetType]) idsByType[a.targetType].push(a.targetId); });

    if (idsByType.Institute.length) {
      const insts = await Institute.find({ _id: { $in: idsByType.Institute } }).lean();
      insts.forEach((i) => pushText([i.instituteName, i.streams, i.specialization, i.courseTitle, i.category].filter(Boolean).join(" ")));
    }
    if (idsByType.Course.length) {
      const courses = await Course.find({ _id: { $in: idsByType.Course } }).lean();
      courses.forEach((c) => pushText([c.courseTitle, c.courseCategory, c.streams, c.specialization].filter(Boolean).join(" ")));
    }
    if (idsByType.Career.length) {
      const careers = await Career.find({ _id: { $in: idsByType.Career } }).lean();
      careers.forEach((c) => pushText([c.title, c.category, c.jobRoles].filter(Boolean).join(" ")));
    }
  } catch (err) {
    console.error("getBehaviorKeywords error:", err.message);
  }

  return Array.from(keywords);
}

// ──────────────────────────────────────────────────────────────────────────
//  AI ranking layer (Gemini). Gracefully no-ops when the API key is absent
//  or the call fails, so the rule-based results are always returned.
// ──────────────────────────────────────────────────────────────────────────

function applyAiRanking(list, aiOrder = [], aiReasons = {}) {
  const rank = new Map(aiOrder.map((id, idx) => [String(id), idx]));
  const out = list.map((it) => {
    const id = String(it._id);
    if (aiReasons[id]) it._aiReason = aiReasons[id];
    return it;
  });
  out.sort((a, b2) => {
    if (a._eligible !== b2._eligible) return a._eligible ? -1 : 1;
    const ra = rank.has(String(a._id)) ? rank.get(String(a._id)) : Infinity;
    const rb = rank.has(String(b2._id)) ? rank.get(String(b2._id)) : Infinity;
    if (ra !== rb) return ra - rb;
    return b2._score - a._score;
  });
  return out;
}

async function rankWithGemini(profile, behavior, institutes, courses, counselors) {
  const budget = Number(profile.budget) || 0;
  const ratioFor = (fee) => (budget && fee ? Math.round((fee / budget) * 100) / 100 : null);
  const candidates = [
    ...institutes.slice(0, 15).map((i) => ({
      id: String(i._id),
      type: "institute",
      name: i.instituteName || i.name,
      course: i.courseTitle || i.specialization || "",
      fee: getInstFee(i),
      feeToBudgetRatio: ratioFor(getInstFee(i)),
      tier: i._tier || "",
      location: [normStr(i.city), normStr(i.state)].filter(Boolean).join(", "),
      behaviorMatch: !!i._behaviorMatch,
    })),
    ...courses.slice(0, 10).map((c) => ({
      id: String(c._id),
      type: "course",
      name: c.courseTitle || c.name,
      fee: Number(c.coursePrice || 0),
      feeToBudgetRatio: ratioFor(Number(c.coursePrice || 0)),
      location: [normStr(c.city), normStr(c.state)].filter(Boolean).join(", "),
      behaviorMatch: !!c._behaviorMatch,
    })),
    ...(counselors || []).slice(0, 8).map((c) => ({
      id: String(c._id),
      type: "counselor",
      name: c.name || [c.firstName, c.lastName].filter(Boolean).join(" "),
      specialization: c.specialization || c.category || "",
      experienceYears: Number(c.ExperienceYear || 0),
      location: [normStr(c.city), normStr(c.state)].filter(Boolean).join(", "),
    })),
  ];
  if (!candidates.length) return null;

  const systemInstruction =
    "You are the FINAL decision-maker for an Indian college-admissions recommendation. " +
    "All candidates are already eligible for the student's exam and marks. " +
    "From the provided list, SELECT the best-fit options and rank them. " +
    "Choose up to 8 institutes, 6 courses, and 5 counselors, ordered by best fit. " +
    "Weigh: how well the course matches the preferred course, affordability (feeToBudgetRatio <= 1 ideal; lower better), " +
    "institute tier/reputation, placement ROI, location fit, and behaviour relevance. " +
    "For each chosen item write a 1-2 sentence reason tied to the student's profile and interests. " +
    "Pick EXACTLY ONE institute as bestMatchId (the single best overall). " +
    "Write a 2-3 sentence personalised summary. " +
    "Respond with STRICT JSON only: { " +
    "\"summary\": string, \"bestMatchId\": string, " +
    "\"institutes\": [ {\"id\": string, \"reason\": string} ], " +
    "\"courses\": [ {\"id\": string, \"reason\": string} ], " +
    "\"counselors\": [ {\"id\": string, \"reason\": string} ] }. " +
    "Only include ids from the provided list.";

  const prompt = JSON.stringify({
    profile: {
      marks: profile.marks,
      exam: profile.exam,
      category: profile.category,
      budget: profile.budget,
      preferredCourse: profile.preferredCourse,
      state: profile.state,
      city: profile.city,
    },
    studentInterests: behavior || [],
    candidates,
  });

  const text = await callGemini({ systemInstruction, prompt, temperature: 0.5, maxTokens: 1500 });
  if (!text) return null;
  const parsed = parseJsonFromGemini(text);
  if (!parsed) return null;

  const reasons = {};
  const valid = new Set(candidates.map((c) => c.id));
  const collect = (arr) =>
    (arr || [])
      .filter((r) => r?.id && valid.has(String(r.id)))
      .map((r) => {
        reasons[String(r.id)] = r.reason;
        return String(r.id);
      });

  return {
    summary: parsed.summary || null,
    bestMatchId: parsed.bestMatchId ? String(parsed.bestMatchId) : null,
    selectedInstituteIds: collect(parsed.institutes),
    selectedCourseIds: collect(parsed.courses),
    selectedCounselorIds: collect(parsed.counselors),
    reasons,
  };
}

// Reorder a list to AI's chosen ids (in priority order); append any remaining
// eligible items so the page never loses results if the model under-selects.
function applyAiSelection(list, selectedIds, reasons) {
  if (!selectedIds || !selectedIds.length) return list;
  const map = new Map(list.map((it) => [String(it._id), it]));
  const out = [];
  selectedIds.forEach((id) => {
    const it = map.get(String(id));
    if (it) {
      if (reasons[String(id)]) it._aiReason = reasons[String(id)];
      out.push(it);
    }
  });
  if (!out.length) return list;
  list.forEach((it) => {
    if (!out.includes(it)) out.push(it);
  });
  return out;
}

// ──────────────────────────────────────────────────────────────────────────
//  Main entry
// ──────────────────────────────────────────────────────────────────────────

export async function getRecommendations(profile = {}, userId) {
  const { marks, exam, category, budget, preferredCourse, state, city } = profile;

  const behavior = userId ? await getBehaviorKeywords(userId) : [];

  // Institutes
  const instQuery = { status: true, deletedAt: null };
  const institutesRaw = await Institute.find(instQuery).limit(300).lean();
  let institutes = institutesRaw.filter((i) => {
    const c = normStr(i.city).toLowerCase();
    const s = normStr(i.state).toLowerCase();
    if (city) return c === city.toLowerCase();
    if (state) return s === state.toLowerCase();
    return true;
  });
  // Budget filter (keep >=3 affordable, else ignore)
  const b = Number(budget);
  if (b) {
    const affordable = institutes.filter((i) => getInstFee(i) <= b * 1.1);
    if (affordable.length >= 3) institutes = affordable;
  }
  institutes = institutes
    .map((i) => scoreInstitute(i, { marks, exam, preferredCourse, budget, state, city, category }, behavior))
    .sort((a, b2) => {
      if (a._eligible !== b2._eligible) return a._eligible ? -1 : 1;
      return b2._score - a._score;
    })
    .slice(0, 15)
    .filter((i) => i._eligible)
    .filter((i) => !exam || i._examMatch === "accepted");

  // Courses
  let coursesRaw = await Course.find({ status: true, deletedAt: null }).limit(200).lean();
  if (preferredCourse) coursesRaw = coursesRaw.filter((c) => normText(c.courseTitle || "").includes(normText(preferredCourse)));
  if (marks) coursesRaw = coursesRaw.filter((c) => !c.cutOff || Number(c.cutOff) <= Number(marks));
  if (b) coursesRaw = coursesRaw.filter((c) => !c.coursePrice || Number(c.coursePrice) <= b * 1.2);
  const courses = coursesRaw
    .map((c) => scoreCourse(c, { marks, preferredCourse, budget }, behavior))
    .sort((a, b2) => b2._score - a._score)
    .slice(0, 10)
    .filter((c) => c._eligible)
    .filter((c) => !exam || checkExamMatch(c, exam) === "accepted");

  // Counselors
  const counselorQuery = { status: true, deletedAt: null };
  let counselorsRaw = await Counselor.find(counselorQuery).limit(200).lean();
  counselorsRaw = counselorsRaw.filter((c) => {
    const cCity = normStr(c.city).toLowerCase();
    const cState = normStr(c.state).toLowerCase();
    if (city) return cCity === city.toLowerCase();
    if (state) return cState === state.toLowerCase();
    return true;
  });
  const counselors = counselorsRaw
    .map((c) => scoreCounselor(c, { state, city, preferredCourse }, behavior))
    .sort((a, b2) => b2._score - a._score)
    .slice(0, 10);

  // Optional AI re-ranking + explanations (no-op if Gemini unavailable).
  let aiSummary = null;
  try {
    const ai = await rankWithGemini(
      { marks, exam, category, budget, preferredCourse, state, city },
      behavior,
      institutes,
      courses,
      counselors
    );
    if (ai) {
      aiSummary = ai.summary;
      institutes = applyAiSelection(institutes, ai.selectedInstituteIds, ai.reasons);
      courses = applyAiSelection(courses, ai.selectedCourseIds, ai.reasons);
      counselors = applyAiSelection(counselors, ai.selectedCounselorIds, ai.reasons);

      // Flag the single best overall match for UI highlighting.
      const bestId = ai.bestMatchId;
      if (bestId) {
        const all = [...institutes, ...courses, ...counselors];
        const hit = all.find((x) => String(x._id) === String(bestId));
        if (hit) hit._bestMatch = true;
      }
    }
  } catch (err) {
    console.error("rankWithGemini error:", err.message);
  }

  return {
    institutes,
    courses,
    counselors,
    behavior: behavior.length ? behavior.slice(0, 8) : [],
    behaviorUsed: behavior.length > 0,
    aiSummary: aiSummary || null,
  };
}
