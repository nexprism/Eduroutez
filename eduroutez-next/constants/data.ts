import { NavItem } from '@/types';
import { url } from 'inspector';



export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: 'users',
    isActive: false,
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Subscription',
    url: '/dashboard/subscription',
    icon: 'award',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Subscriptions',
    url: '/dashboard/subscriptions',
    icon: 'award',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Streams',
    url: '/dashboard/stream',
    icon: 'microscope',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Courses',
    url: '/dashboard/course',
    icon: 'bookmark',
    isActive: false,
    items: [
      {
        title: 'Course',
        url: '/dashboard/course'
      },
      {
        title: 'Category',
        url: '/dashboard/course-category'
      }
    ]
  },
  {
    title: 'Bulk Institute Upload',
    url: '/dashboard/bulk-institute-upload',
    icon: 'school',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Institutes',
    url: '/dashboard/institute',
    icon: 'school',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Counselors',
    url: '/dashboard/counselor',
    icon: 'users',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Admins',
    url: '/dashboard/admin',
    icon: 'usersround',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Students',
    url: '/dashboard/student',
    icon: 'cap',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Email Templates',
    url: '/dashboard/email',
    icon: 'mail',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'SMS Templates',
    url: '/dashboard/sms',
    icon: 'message-square',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Earnings',
    url: '/dashboard/earning',
    icon: 'indian-rupee',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Payouts',
    url: '/dashboard/payout',
    icon: 'banknote',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Recruiter',
    url: '/dashboard/recruiter',
    icon: 'message-circle',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Reviews',
    url: '/dashboard/review',
    icon: 'message-circle',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Slots',
    url: '/dashboard/slot',
    icon: 'message-circle',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Sales',
    url: '/dashboard/sales',
    icon: 'chart-no-axes-combined',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Support',
    url: '/dashboard/support',
    icon: 'chart-no-axes-combined',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Media',
    url: '/dashboard/banner',
    icon: 'bookmark',
    isActive: false,
    items: [
      {
        title: 'Banner',
        url: '/dashboard/banner'
      },
      {
        title: 'Gallery',
        url: '/dashboard/media'
      }
    ]
  },

  // {
  //   title: 'Newsletter',
  //   url: '/dashboard/newsletter',
  //   icon: 'mails',
  //   isActive: false,
  //   items: [] // No child items
  // },

  {
    title: 'Promotions',
    url: '/dashboard/promotion',
    icon: 'message-square',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Manage Pages',
    url: '/dashboard/manage-page',
    icon: 'scroll-text',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Queries',
    url: '/dashboard/query',
    icon: 'rocket',
    isActive: false,
    items: [] // No child items
  },

  {
    title: 'Blogs',
    url: '/dashboard/blog',
    icon: 'post',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'News',
    url: '/dashboard/news',
    icon: 'post',
    isActive: false,
    items: [] // No child items
  },

  {
    title: 'Career',
    url: '/dashboard/career',
    icon: 'post',
    isActive: false,
    items: [] // No child items
  },

  // {
  //   title: 'Import and Export Data',
  //   url: '/dashboard/import-export',
  //   icon: 'download',
  //   isActive: false,
  //   items: [] // No child items
  // },

  // {
  //   title: 'Chats',
  //   url: '/dashboard/chat',
  //   icon: 'message-circle-more',
  //   isActive: false,
  //   items: [] // No child itemspreloa
  // },
  {
    title: 'Webinars',
    url: '/dashboard/webinar',
    icon: 'laptop-minimal',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'FAQs',
    url: '/dashboard/question-answer',
    icon: 'message-circle-question',
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Questions and Answers',
    url: '/dashboard/answer',
    icon: 'message-circle-question',
    isActive: false,
    items: [] // No child items
  },
  

  {
    title: 'Online counselling',
    url: '/dashboard/scheduled-counselling-list',
    icon: 'scroll-text',
    isActive: false,
    items: [
    ] // No child items
  },
  {
    title: 'Online counselling list',
    url: '/dashboard/online-counselling-list',
    icon: 'scroll-text',
    isActive: false,
    items: [] // No child items
  },

   {
 title: 'Refer and Earn',
   url: '/dashboard/refer-earn',
   icon: 'receipt-indian-rupee',
  isActive: false,
  items: [] // No child items
},
{
  title: 'Redeem',
    url: '/dashboard/redeem',
    icon: 'receipt-indian-rupee',
   isActive: false,
   items: [] // No child items
 },
 {
  title: 'Help And Support',
  url: '/dashboard/help-support',
  icon: 'school',
  isActive: false,
  items: [] // No child items
}
];
