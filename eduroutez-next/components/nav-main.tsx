'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useSession } from '@/components/layout/session-context';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';

export function NavMain({
  items
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

  // Try to read counsellor id and role from localStorage
  const instituteId = typeof window !== 'undefined' ? localStorage.getItem('instituteId') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const { ready: sessionReady } = useSession();

  const { data: counselor, isLoading: counselorLoading, isError: counselorError, error: counselorErrorObj } = useQuery({
    queryKey: ['sidebar-counselor', instituteId],
    queryFn: async () => {
      if (!instituteId) return null;
      const res = await axiosInstance.get(`${apiUrl}/counselor-by-id/${instituteId}`);
      return res.data?.data || null;
    },
    enabled: sessionReady && !!instituteId
  });

  React.useEffect(() => {
    try {
      console.log('NavMain debug', {
        sessionReady,
        instituteId,
        role,
        counselorPresent: !!counselor,
        counselorData: counselor,
        counselorError,
        scheduledTestDate_local: typeof window !== 'undefined' ? localStorage.getItem('scheduledTestDate') : null,
        scheduledTestSlot_local: typeof window !== 'undefined' ? localStorage.getItem('scheduledTestSlot') : null
      });
    } catch (e) {
      // ignore when SSR
    }
    if (counselorError) console.log('Sidebar: fetch error=', counselorErrorObj);
  }, [instituteId, role, counselor, counselorError, counselorErrorObj]);

  const [remaining, setRemaining] = React.useState<number | null>(null);
  const [autoTriggered, setAutoTriggered] = React.useState(false);
  React.useEffect(() => {
    // prefer counselor.scheduledTestDate, fallback to client-stored scheduledTestDate
    const storedDate = typeof window !== 'undefined' ? localStorage.getItem('scheduledTestDate') : null;
    const scheduled = counselor?.scheduledTestDate || storedDate;
    if (!scheduled) {
      setRemaining(null);
      return;
    }
    const dt = new Date(scheduled);
    const update = () => {
      const diff = dt.getTime() - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [counselor]);

  // When timer reaches zero, auto-call the eligibility endpoint once
  React.useEffect(() => {
    if (remaining === null) return;
    if (remaining > 0) return;
    if (autoTriggered) return;
    // only trigger once
    setAutoTriggered(true);
    (async () => {
      try {
        const res = await axiosInstance.get(`${apiUrl}/counselor-test/can-give`);
        if (res?.data?.data?.eligible) {
          // navigate to test page
          window.location.href = '/dashboard/counselor-test';
        } else {
          // show a toast if not eligible
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { toast } = require('sonner');
          toast.error(res?.data?.message || 'Not yet eligible to start the test');
        }
      } catch (err) {
        const { toast } = require('sonner');
        toast.error('Failed to open test automatically');
      }
    })();
  }, [remaining, autoTriggered]);

  const formatRemaining = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {/* Scheduled test timer (visible to counsellor) */}
        {role === 'counsellor' && sessionReady && (counselor?.scheduledTestDate || (typeof window !== 'undefined' ? localStorage.getItem('scheduledTestDate') : null)) && (
          <SidebarMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip="Scheduled Test">
                  <span>Test: {counselor?.scheduledTestSlot || (typeof window !== 'undefined' ? localStorage.getItem('scheduledTestSlot') : '') || ''}</span>
                  <span className="ml-auto text-xs font-mono">{remaining !== null ? formatRemaining(remaining) : '-'}</span>
                  <div className="ml-2">
                    <Button
                      variant="ghost"
                      className="text-xs px-2 py-1"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await axiosInstance.get(`${apiUrl}/counselor-test/questions`);
                          window.location.href = '/dashboard/counselor-test';
                        } catch (err) {
                          toast.error('Unable to open test now');
                        }
                      }}
                      disabled={remaining !== null && remaining > 0}
                    >
                      Open
                    </Button>
                  </div>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Scheduled Test</DialogTitle>
                <DialogDescription>
                  <div className="space-y-2">
                    <div>Scheduled for: <strong>{new Date(counselor?.scheduledTestDate || (typeof window !== 'undefined' ? localStorage.getItem('scheduledTestDate') : '')).toLocaleString()}</strong></div>
                    <div>Slot: {counselor?.scheduledTestSlot || (typeof window !== 'undefined' ? localStorage.getItem('scheduledTestSlot') : '-') || '-'}</div>
                    <div>Starts in: <strong>{remaining !== null ? formatRemaining(remaining) : '-'}</strong></div>
                  </div>
                </DialogDescription>
                <DialogFooter>
                  <div className="flex gap-2">
                    <Button onClick={async () => {
                      try {
                        const res = await axiosInstance.get(`${apiUrl}/counselor-test/can-give`);
                        if (res.data?.success) {
                          window.location.href = '/dashboard/counselor-test';
                        } else {
                          toast.error(res.data?.message || 'Not yet eligible');
                        }
                      } catch (err) {
                        toast.error('Failed to check eligibility');
                      }
                    }} disabled={remaining !== null && remaining > 0}>Start Test</Button>

                    <Button variant="ghost" onClick={async () => {
                      try {
                        // attempt to fetch questions first; service will gate by eligibility
                        await axiosInstance.get(`${apiUrl}/counselor-test/questions`);
                        window.location.href = '/dashboard/counselor-test';
                      } catch (err) {
                        // show friendly message
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        const { toast } = require('sonner');
                        toast.error('Unable to open test now');
                      }
                    }} disabled={remaining !== null && remaining > 0}>Open Test</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        )}
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
