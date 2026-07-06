const STAFF_PERMISSIONS = {
  admin: {
    label: 'Administrator',
    allowedModules: [
      'dashboard', 'profile', 'courses', 'course-category', 'queries',
      'recommendations', 'news', 'faqs', 'question-answer', 'team',
      'subscription', 'webinar', 'blog', 'career', 'recruiter'
    ],
    description: 'Full access to all institute modules'
  },
  admissions: {
    label: 'Admissions Team',
    allowedModules: [
      'dashboard', 'profile', 'courses', 'course-category', 'queries',
      'recommendations', 'question-answer'
    ],
    description: 'Manage courses, inquiries, and recommendations'
  },
  marketing: {
    label: 'Marketing Team',
    allowedModules: [
      'dashboard', 'profile', 'news', 'blog', 'webinar',
      'promotions', 'question-answer'
    ],
    description: 'Manage promotions, news, blogs, and webinars'
  },
  hod: {
    label: 'Department Head',
    allowedModules: [
      'dashboard', 'profile', 'courses', 'course-category', 'queries',
      'faqs', 'question-answer', 'recommendations', 'career', 'recruiter'
    ],
    description: 'Oversee courses, queries, and departmental content'
  }
};

const MODULE_ROUTES = {
  'dashboard': '/dashboard/overview',
  'profile': '/dashboard/profile',
  'courses': '/dashboard/course',
  'course-category': '/dashboard/course-category',
  'queries': '/dashboard/query',
  'recommendations': '/dashboard/recommendation',
  'news': '/dashboard/news',
  'faqs': '/dashboard/question-answer',
  'question-answer': '/dashboard/question-answer',
  'team': '/dashboard/team',
  'subscription': '/dashboard/subscription',
  'webinar': '/dashboard/webinar',
  'blog': '/dashboard/blog',
  'career': '/dashboard/career',
  'recruiter': '/dashboard/recruiter',
  'promotions': '/dashboard/promotion',
};

export { STAFF_PERMISSIONS, MODULE_ROUTES };
