'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { ChevronRight, GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Breadcrumbs } from '../breadcrumbs';
import { Icons } from '../icons';
import ThemeToggle from './ThemeToggle/theme-toggle';
import { UserNav } from './user-nav';
import { useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export const company = {
  name: 'Eduroutez App Inc.',
  logo: GalleryVerticalEnd,
  plan: 'Enterprise'
};

export default function AppSidebar({
  children
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [filteredNavItems, setFilteredNavItems] = React.useState(navItems);
  const pathname = usePathname();
  // Only render after first client-side mount
  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('role');
    const excludedTitles =
      role === 'institute'
        ? ['Institutes', 'Admins','Refer and Earn','Reviews','Review','Manage Pages','Subscriptions','Bulk Institute Upload','Help And Support','Earnings','Payouts','Promotions', 'Streams','Redeem','Students', 'Sales','Media','Online counselling list','Online counselling','Slots'] // Titles to exclude for 'institute'
        : role === 'counsellor'
        ? [
            'Institutes',
            'Admins',
            'Queries',
            'Promotions',
            'Refer and Earn',
            'FAQs',
            'News',
            'Reviews',
            'Streams',
            'Media',
            'Online counselling',
            'Subscription',
            'Courses',
            'Streams',
            'Recruiter',
            'Manage Pages', 
            'Counselors',
            'Admins',
            'Students',
            'Email Templates',
            'SMS Templates',
            'Media',
            'Promotions',
            'Blogs',
            'Career',
            'Subscriptions',
            'Bulk Institute Upload',
            'Online counselling list',
            'Webinars',
            'Help And Support'
          ] // Titles to exclude for 'counsellor'
        : ['Online counselling','Slots','Subscription',,'Review','Profile','Support','Redeem']; // Default: no exclusions

    const filteredItems = navItems.filter(
      (item) => !excludedTitles.includes(item.title)
    );

    setFilteredNavItems(filteredItems);
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/subscription/${localStorage.getItem('plan')}`
      );
      return response.data;
    },
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'institute' && subscription?.data?.name === 'Standard') {
      setFilteredNavItems((prevItems) =>
        prevItems.filter((item) => !['Email Templates', 'SMS Templates'].includes(item.title))
      );
    }
  }, [subscription]); // Depend on subscription

  if (!mounted) {
    return null; // Render nothing or a skeleton until mounted
  }


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex gap-2 py-2 text-sidebar-accent-foreground ">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <company.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{company.name}</span>
              <span className="truncate text-xs">{company.plan}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel>Overview </SidebarGroupLabel>
            <SidebarMenu>
              {filteredNavItems?.map((item) => {
                const Icon = item.icon ? Icons[item.icon as keyof typeof Icons] : Icons.logo;
                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname === item.url}
                        >
                          {item.icon && <Icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem:any) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        {/* <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={''} alt={''} />
                      <AvatarFallback className="rounded-lg">
                        {'CN1'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {'Rahil A.'}
                      </span>
                      <span className="truncate text-xs">
                        {'rahil@coder.com'}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={''} alt={''} />
                        <AvatarFallback className="rounded-lg">
                          {'CN2'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {'Rahil A.'}
                        </span>
                        <span className="truncate text-xs">
                          {' '}
                          {'rahil@coder.com'}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter> */}
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="overflow-x-auto">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>
          <div className=" hidden w-1/3 items-center gap-2 px-4 md:flex ">
            {/* <SearchInput /> */}
          </div>
          <div className="flex items-center gap-2 px-4">
            <UserNav />
            <ThemeToggle />
          </div>
        </header>
        {/* page main content */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
