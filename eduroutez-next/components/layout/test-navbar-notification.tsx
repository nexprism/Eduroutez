'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Play } from 'lucide-react';

export default function TestNavbarNotification() {
  const router = useRouter();
  const pathname = usePathname();
  const [isTestTime, setIsTestTime] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkTest = () => {
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);

      if (storedRole !== 'counsellor') return;

      const sd = localStorage.getItem('scheduledTestDate');
      const ss = localStorage.getItem('scheduledTestSlot');

      if (!sd) {
        setIsTestTime(false);
        return;
      }

      const date = new Date(sd);
      if (ss && ss.includes(':')) {
        const [hours, minutes] = ss.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
      }

      const now = new Date();
      const diff = date.getTime() - now.getTime();

      // Show notification if test is within 10 minutes or already started
      if (diff < 10 * 60 * 1000) {
        setIsTestTime(true);
      } else {
        setIsTestTime(false);
      }
    };

    checkTest();
    // Re-check periodically
    const interval = setInterval(checkTest, 30000);
    
    // Listen for custom events
    window.addEventListener('counselor-test-update', checkTest);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('counselor-test-update', checkTest);
    };
  }, []);

  // Only show if test is active and user is NOT on the overview page
  // (The large banner handles visibility on the overview page)
  if (!isTestTime || role !== 'counsellor' || pathname === '/dashboard/overview') return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/20 rounded-full transition-all hover:shadow-sm group">
      <div className="relative">
        <Play className="h-3 w-3 text-red-600 fill-red-600" />
        <div className="absolute -inset-1 bg-red-400 rounded-full opacity-30 animate-ping" />
      </div>
      <button 
        onClick={() => router.push('/dashboard/counselor-test')}
        className="text-[11px] font-bold text-red-700 dark:text-red-400 group-hover:text-red-800 dark:group-hover:text-red-300 transition-colors whitespace-nowrap"
      >
        Start Assessment &rarr;
      </button>
    </div>
  );
}
