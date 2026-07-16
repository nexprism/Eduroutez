import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import Career from "../models/Career.js";
import Course from "../models/Course.js";
import Institute from "../models/Institute.js";

const normText = (str) =>
  (str || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

const tokenize = (str) =>
  normText(str)
    .split(/\s+/)
    .filter((w) => w.length >= 3);

const scoreByKeywordOverlap = (sourceTokens, targetFields) => {
  const haystack = normText(targetFields);
  if (!haystack) return 0;
  return sourceTokens.reduce((sum, tok) => sum + (haystack.includes(tok) ? 1 : 0), 0);
};

const isObjectId = (v) => /^[a-fA-F0-9]{24}$/.test(String(v));

async function resolveContent(contentType, idOrSlug) {
  let query;
  if (isObjectId(idOrSlug)) {
    query = { _id: idOrSlug };
  } else {
    query = { slug: idOrSlug };
  }

  if (contentType === "blog") return Blog.findOne(query).lean();
  if (contentType === "career") return Career.findOne(query).lean();
  if (contentType === "course") return Course.findOne(query).lean();
  if (contentType === "institute") return Institute.findOne(query).lean();
  return null;
}

export async function getRelatedContent({ contentId, contentType, limit = 6 }) {
  const results = { blogs: [], careers: [], courses: [], institutes: [] };

  const sourceItem = await resolveContent(contentType, contentId);
  if (!sourceItem) return results;

  const titleField = sourceItem.title || sourceItem.courseTitle || sourceItem.instituteName || "";
  const descField = sourceItem.description || sourceItem.shortDescription || sourceItem.longDescription || sourceItem.about || "";
  const catString = sourceItem.category || sourceItem.courseCategory || "";
  const streamId = sourceItem.stream || null;
  const instId = sourceItem.instituteId || sourceItem.courseCreatedBy || null;
  const streamsArr = sourceItem.streams || [];

  const sourceTokens = tokenize(`${titleField} ${catString} ${descField}`);

  const currentId = sourceItem._id;

  const rankAndSlice = (items, scoreFn) =>
    items
      .map((item) => ({ ...item, _relScore: scoreFn(item) }))
      .sort((a, b) => b._relScore - a._relScore)
      .slice(0, limit);

  const textSearch = (tokens, fields) => {
    if (tokens.length < 2) return {};
    const regex = new RegExp(tokens.map((t) => `(?=.*${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`).join(""), "i");
    const orClauses = fields.map((f) => ({ [f]: regex }));
    return { $or: orClauses };
  };

  // ── Blogs ──────────────────────────────────────────────
  try {
    const blogQuery = {
      isPublished: true, isActive: true, deletedAt: null,
      _id: { $ne: currentId },
    };
    const blogOr = [];

    if (catString) blogOr.push({ category: { $regex: new RegExp(normText(catString), "i") } });
    if (streamId) blogOr.push({ stream: streamId });
    if (instId) blogOr.push({ instituteId: instId });
    if (streamsArr.length) blogOr.push({ category: { $in: streamsArr.map((s) => new RegExp(s, "i")) } });

    const textClause = textSearch(sourceTokens, ["title", "description"]);
    if (textClause.$or) blogOr.push(textClause);

    if (blogOr.length) blogQuery.$or = blogOr;

    let blogs = await Blog.find(blogQuery)
      .sort({ views: -1, createdAt: -1 })
      .limit(limit * 2)
      .lean();

    if (!blogs.length && sourceTokens.length >= 2) {
      blogs = await Blog.find({
        isPublished: true, isActive: true, deletedAt: null,
        _id: { $ne: currentId },
        ...textSearch(sourceTokens, ["title", "description"]),
      }).sort({ views: -1, createdAt: -1 }).limit(limit * 2).lean();
    }

    results.blogs = rankAndSlice(blogs, (b) =>
      scoreByKeywordOverlap(sourceTokens, `${b.title} ${b.category || ""} ${b.description || ""}`)
    );
  } catch (e) {
    console.error("related-content blogs error:", e.message);
  }

  // ── Careers ────────────────────────────────────────────
  try {
    const careerQuery = {
      isPublished: true, isActive: true, deletedAt: null,
      _id: { $ne: currentId },
    };
    const careerOr = [];

    if (catString) careerOr.push({ category: { $regex: new RegExp(normText(catString), "i") } });
    if (streamId) careerOr.push({ stream: streamId });
    if (instId) careerOr.push({ instituteId: instId });
    if (streamsArr.length) careerOr.push({ category: { $in: streamsArr.map((s) => new RegExp(s, "i")) } });

    const textClause = textSearch(sourceTokens, ["title", "description"]);
    if (textClause.$or) careerOr.push(textClause);

    if (careerOr.length) careerQuery.$or = careerOr;

    let careers = await Career.find(careerQuery)
      .sort({ views: -1, createdAt: -1 })
      .limit(limit * 2)
      .lean();

    if (!careers.length && sourceTokens.length >= 2) {
      careers = await Career.find({
        isPublished: true, isActive: true, deletedAt: null,
        _id: { $ne: currentId },
        ...textSearch(sourceTokens, ["title", "description"]),
      }).sort({ views: -1, createdAt: -1 }).limit(limit * 2).lean();
    }

    results.careers = rankAndSlice(careers, (c) =>
      scoreByKeywordOverlap(sourceTokens, `${c.title} ${c.category || ""} ${c.description || ""} ${c.jobRoles || ""}`)
    );
  } catch (e) {
    console.error("related-content careers error:", e.message);
  }

  // ── Courses ────────────────────────────────────────────
  try {
    const courseQuery = {
      isActive: true, isPublished: true, deletedAt: null,
      _id: { $ne: currentId },
    };
    const courseOr = [];

    if (catString) {
      courseOr.push(
        { courseTitle: { $regex: new RegExp(normText(catString), "i") } },
        { category: catString },
        { courseCategory: { $regex: new RegExp(normText(catString), "i") } },
      );
    }
    if (streamId) {
      courseOr.push({ category: streamId });
    }
    if (instId) courseOr.push({ courseCreatedBy: instId });
    if (streamsArr.length) {
      courseOr.push({ courseTitle: { $in: streamsArr.map((s) => new RegExp(s, "i")) } });
    }

    const textClause = textSearch(sourceTokens, ["courseTitle", "shortDescription", "longDescription"]);
    if (textClause.$or) courseOr.push(textClause);

    if (courseOr.length) courseQuery.$or = courseOr;

    let courses = await Course.find(courseQuery)
      .sort({ views: -1, createdAt: -1 })
      .limit(limit * 2)
      .lean();

    if (!courses.length && sourceTokens.length >= 2) {
      courses = await Course.find({
        isActive: true, isPublished: true, deletedAt: null,
        _id: { $ne: currentId },
        ...textSearch(sourceTokens, ["courseTitle", "shortDescription", "longDescription"]),
      }).sort({ views: -1, createdAt: -1 }).limit(limit * 2).lean();
    }

    results.courses = rankAndSlice(courses, (c) =>
      scoreByKeywordOverlap(sourceTokens, `${c.courseTitle || ""} ${c.shortDescription || ""} ${c.courseCategory || ""}`)
    );
  } catch (e) {
    console.error("related-content courses error:", e.message);
  }

  // ── Institutes ─────────────────────────────────────────
  try {
    const instQuery = {
      status: true, deletedAt: null,
      _id: { $ne: currentId },
    };
    const instOr = [];

    if (streamsArr.length) instOr.push({ streams: { $in: streamsArr } });
    if (catString) {
      instOr.push(
        { instituteName: { $regex: new RegExp(normText(catString), "i") } },
        { specialization: { $regex: new RegExp(normText(catString), "i") } },
      );
    }
    if (sourceItem.organization) instOr.push({ organization: sourceItem.organization });
    if (sourceItem.organisationType) instOr.push({ organisationType: sourceItem.organisationType });

    const textClause = textSearch(sourceTokens, ["instituteName", "about"]);
    if (textClause.$or) instOr.push(textClause);

    if (instOr.length) instQuery.$or = instOr;

    let institutes = await Institute.find(instQuery)
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 2)
      .lean();

    if (!institutes.length && sourceTokens.length >= 2) {
      institutes = await Institute.find({
        status: true, deletedAt: null,
        _id: { $ne: currentId },
        ...textSearch(sourceTokens, ["instituteName", "about"]),
      }).sort({ rating: -1, createdAt: -1 }).limit(limit * 2).lean();
    }

    results.institutes = rankAndSlice(institutes, (i) =>
      scoreByKeywordOverlap(sourceTokens, `${i.instituteName || ""} ${i.about || ""} ${(i.streams || []).join(" ")} ${(i.specialization || []).join(" ")}`)
    );
  } catch (e) {
    console.error("related-content institutes error:", e.message);
  }

  return results;
}
