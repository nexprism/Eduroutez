import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Video,
  ShoppingCart,
  BarChart3
} from 'lucide-react';

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          active: pathname.includes('/dashboard'),
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: 'Contents',
      menus: [
        {
          href: '',
          label: 'Posts',
          active: pathname.includes('/posts'),
          icon: SquarePen,
          submenus: [
            {
              href: '/posts',
              label: 'All Posts'
            },
            {
              href: '/posts/new',
              label: 'New Post'
            }
          ]
        },
        {
          href: '/categories',
          label: 'Categories',
          active: pathname.includes('/categories'),
          icon: Bookmark
        },
        {
          href: '/tags',
          label: 'Tags',
          active: pathname.includes('/tags'),
          icon: Tag
        }
      ]
    },
    {
      groupLabel: 'Webinar Packages',
      menus: [
        {
          href: '/dashboard/webinar-package',
          label: 'Manage Packages',
          active: pathname.includes('/webinar-package'),
          icon: Video,
          submenus: [
            {
              href: '/dashboard/webinar-package',
              label: 'All Packages'
            },
            {
              href: '/dashboard/webinar-package/create',
              label: 'Create Package'
            },
            {
              href: '/dashboard/webinar-packages/admin/purchases',
              label: 'All Purchases'
            },
            {
              href: '/dashboard/webinar-packages/admin/statistics',
              label: 'Statistics'
            }
          ]
        },
        {
          href: '/dashboard/webinar-packages',
          label: 'Browse & Purchase',
          active: pathname.includes('/dashboard/webinar-packages') && !pathname.includes('/admin'),
          icon: ShoppingCart,
          submenus: [
            {
              href: '/dashboard/webinar-packages',
              label: 'Available Packages'
            },
            {
              href: '/dashboard/webinar-packages/my-purchases',
              label: 'My Purchases'
            }
          ]
        },
        {
          href: '/dashboard/webinar-packages/my-purchases',
          label: 'My Purchases',
          active: pathname.includes('/dashboard/webinar-packages/my-purchases'),
          icon: Bookmark
        }
      ]
    },
    {
      groupLabel: 'Settings',
      menus: [
        {
          href: '/users',
          label: 'Users',
          active: pathname.includes('/users'),
          icon: Users
        },
        {
          href: '/account',
          label: 'Account',
          active: pathname.includes('/account'),
          icon: Settings
        }
      ]
    }
  ];
}
