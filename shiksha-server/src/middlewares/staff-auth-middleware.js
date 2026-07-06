import { STAFF_PERMISSIONS } from "../config/staff-permissions.js";
import accessTokenAutoRefresh from "./accessTokenAutoRefresh.js";
import passport from "passport";
import Institute from "../models/Institute.js";

const permsCache = new Map();

async function getAllowedModules(user) {
  const cacheKey = `${user.instituteId}_${user.subRole}`;
  if (permsCache.has(cacheKey)) return permsCache.get(cacheKey);

  try {
    const institute = await Institute.findById(user.instituteId).lean();
    const custom = institute?.staffPermissions?.get?.(user.subRole);
    const modules = custom || STAFF_PERMISSIONS[user.subRole]?.allowedModules || [];
    permsCache.set(cacheKey, modules);
    setTimeout(() => permsCache.delete(cacheKey), 10000);
    return modules;
  } catch {
    return STAFF_PERMISSIONS[user.subRole]?.allowedModules || [];
  }
}

const ROUTE_MODULE_MAP = [
  // Courses
  { method: 'POST', pattern: '/course', module: 'courses' },
  { method: 'GET', pattern: '/courses', module: 'courses' },
  { method: 'PATCH', pattern: '/course/:id', module: 'courses' },
  { method: 'DELETE', pattern: '/course/:id', module: 'courses' },
  { method: 'GET', pattern: '/course/:id', module: 'courses' },
  { method: 'GET', pattern: '/course-by-institute/:id', module: 'courses' },

  // Course Category
  { method: 'POST', pattern: '/course-category', module: 'course-category' },
  { method: 'GET', pattern: '/course-categories', module: 'course-category' },
  { method: 'PATCH', pattern: '/course-category/:id', module: 'course-category' },
  { method: 'DELETE', pattern: '/course-category/:id', module: 'course-category' },

  // Queries
  { method: 'POST', pattern: '/query', module: 'queries' },
  { method: 'GET', pattern: '/queries', module: 'queries' },
  { method: 'PATCH', pattern: '/query/:id', module: 'queries' },
  { method: 'DELETE', pattern: '/query/:id', module: 'queries' },

  // Recommendations
  { method: 'GET', pattern: '/recommendations', module: 'recommendations' },
  { method: 'POST', pattern: '/recommendation', module: 'recommendations' },

  // News
  { method: 'POST', pattern: '/create-news', module: 'news' },
  { method: 'GET', pattern: '/news', module: 'news' },
  { method: 'PATCH', pattern: '/update-news/:id', module: 'news' },
  { method: 'DELETE', pattern: '/news/:id', module: 'news' },

  // Blogs
  { method: 'POST', pattern: '/blog', module: 'blog' },
  { method: 'GET', pattern: '/blogs', module: 'blog' },
  { method: 'PATCH', pattern: '/blog/:id', module: 'blog' },
  { method: 'DELETE', pattern: '/blog/:id', module: 'blog' },

  // Webinars
  { method: 'POST', pattern: '/webinar', module: 'webinar' },
  { method: 'GET', pattern: '/webinars', module: 'webinar' },
  { method: 'PATCH', pattern: '/webinar/:id', module: 'webinar' },
  { method: 'DELETE', pattern: '/webinar/:id', module: 'webinar' },

  // Promotions
  { method: 'POST', pattern: '/promotion', module: 'promotions' },
  { method: 'GET', pattern: '/promotions', module: 'promotions' },
  { method: 'PATCH', pattern: '/promotion/:id', module: 'promotions' },
  { method: 'DELETE', pattern: '/promotion/:id', module: 'promotions' },

  // Career
  { method: 'POST', pattern: '/career', module: 'career' },
  { method: 'GET', pattern: '/careers', module: 'career' },
  { method: 'PATCH', pattern: '/career/:id', module: 'career' },
  { method: 'DELETE', pattern: '/career/:id', module: 'career' },

  // Recruiter
  { method: 'POST', pattern: '/recruiter', module: 'recruiter' },
  { method: 'GET', pattern: '/recruiters', module: 'recruiter' },
  { method: 'PATCH', pattern: '/recruiter/:id', module: 'recruiter' },
  { method: 'DELETE', pattern: '/recruiter/:id', module: 'recruiter' },

  // FAQs / Question Answer
  { method: 'POST', pattern: '/question-answer', module: 'question-answer' },
  { method: 'GET', pattern: '/question-answers', module: 'question-answer' },
  { method: 'PATCH', pattern: '/question-answer/:id', module: 'question-answer' },
  { method: 'DELETE', pattern: '/question-answer/:id', module: 'question-answer' },
  { method: 'POST', pattern: '/faq', module: 'faqs' },
  { method: 'GET', pattern: '/faq', module: 'faqs' },
  { method: 'PATCH', pattern: '/faq/:id', module: 'faqs' },
  { method: 'DELETE', pattern: '/faq/:id', module: 'faqs' },
];

export async function staffAuth(req, res, next) {
  if (!req.user || req.user.role !== 'institute_staff') {
    return next();
  }

  const method = req.method.toUpperCase();
  const path = req.originalUrl.replace('/api/v1', '').split('?')[0];

  const allowedModules = await getAllowedModules(req.user);
  if (!allowedModules.length) {
    return res.status(403).json({ success: false, message: 'No permissions configured for your role' });
  }

  const matched = ROUTE_MODULE_MAP.find((route) => {
    if (route.method !== method) return false;
    const routeParts = route.pattern.split('/');
    const pathParts = path.split('/');
    if (routeParts.length !== pathParts.length) return false;
    return routeParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
  });

  if (!matched) {
    return next();
  }

  if (!allowedModules.includes(matched.module)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Your role (${req.user.subRole}) does not have permission for this resource.`
    });
  }

  next();
}

/**
 * Combined middleware chain for protected routes:
 * accessTokenAutoRefresh -> passport.authenticate -> staffAuth
 */
export const requireAuth = [
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  staffAuth,
];
