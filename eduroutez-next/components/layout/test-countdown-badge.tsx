'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, Play, GraduationCap, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestCountdownBadge() {
  const router = useRouter();
  const pathname = usePathname();
  const [testTime, setTestTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isTestTime, setIsTestTime] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client
    const checkTest = () => {
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);

      if (storedRole !== 'counsellor') return;

      const sd = localStorage.getItem('scheduledTestDate');
      const ss = localStorage.getItem('scheduledTestSlot');

      // if (!sd) {
      //   setTestTime(null);
      //   return;
      // }
      if (!sd) return;

      // Parse the scheduled date.
      // If it's a full ISO string, we use it.
      const date = new Date(sd);
      
      // If slot is provided (e.g. "12:00"), we might need to adjust the time if date only contains YYYY-MM-DD
      if (ss && ss.includes(':')) {
        const [hours, minutes] = ss.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
      }

      setTestTime(date);
    };

    checkTest();
    // Re-check periodically in case localStorage changes
    const interval = setInterval(checkTest, 30000);
    
    // Listen for custom event (login/profile sync)
    window.addEventListener('counselor-test-update', checkTest);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('counselor-test-update', checkTest);
    };
  }, []);

  useEffect(() => {
    if (!testTime || !isVisible) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = testTime.getTime() - now.getTime();

      // Always compute how many whole days have passed since the scheduled date
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysPast = (now.getTime() - testTime.getTime()) / msPerDay;

      // If more than 3 days have passed since scheduled date, mark expired
      if (daysPast > 3) {
        setIsExpired(true);
        setIsTestTime(false);
        setTimeLeft(null);
        return;
      }

      // Not expired — ensure flag is cleared
      setIsExpired(false);

      // If the scheduled test is in the past or now, allow starting
      if (diff <= 0) {
        setIsTestTime(true);
        setTimeLeft(null);
        return;
      }

      // Within 10 minutes of test, allow starting
      if (diff < 10 * 60 * 1000) {
        setIsTestTime(true);
      } else {
        setIsTestTime(false);
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [testTime, isVisible]);

  if (!isVisible || role !== 'counsellor' || !testTime || pathname !== '/dashboard/overview') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative w-full py-4 lg:py-6 mt-4 z-10"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-slate-900 border border-red-100 dark:border-red-800/10 shadow-sm rounded-2xl py-4 md:p-5 flex flex-col md:flex-row items-center gap-4 group">
          {/* Status Icon with Dynamic Ring */}
          <div className="relative shrink-0">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm ${isTestTime ? 'bg-red-500 text-white shadow-red-200 animate-pulse scale-105 md:scale-110' : 'bg-red-100/50 text-red-600'}`}>
              {isTestTime ? <Play className="h-6 w-6 fill-current" /> : <Clock className="h-6 w-6" />}
            </div>
            {isTestTime && (
               <div className="absolute -inset-1 bg-red-400 rounded-xl opacity-20 animate-ping -z-10" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600/80 dark:text-red-400">
                Certification Assessment {!isTestTime && testTime && `• ${testTime.toLocaleDateString([], { weekday: 'long' })}`}
              </span>
              <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-red-200 dark:bg-red-800" />
              {isTestTime ? (
                 <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Test Portal is Open!</span>
              ) : (
                 <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Upcoming scheduled assessment</span>
              )}
            </div>
            
            {isTestTime ? (
               <div className="mt-1">
                  <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">IT'S TEST TIME!</p>
               </div>
            ) : timeLeft ? (
              <div className="mt-1 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {timeLeft.hours.toString().padStart(2, '0')}:
                    {timeLeft.minutes.toString().padStart(2, '0')}:
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500/70 border-l border-slate-200 dark:border-slate-800 pl-2">REMAINING</span>
                </div>
                <div className="px-2 py-0.5 bg-red-100/50 dark:bg-red-900/30 rounded-md flex items-center gap-1.5">
                   <Calendar className="h-3 w-3 text-red-600 dark:text-red-400" />
                   <p className="text-[10px] text-red-700 dark:text-red-400 font-bold tracking-wide">
                     {testTime.toLocaleDateString([], { day: 'numeric', month: 'short' }).toUpperCase()} @ {testTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 w-full md:w-auto flex items-center gap-3">
            {isTestTime && !isExpired && !timeLeft && (
              <Button 
                className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-5 md:py-2 rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                onClick={() => router.push('/dashboard/test-benefits')}
              >
                Start Test
                <span className="inline-block transform transition-transform group-hover/btn:translate-x-1">→</span>
              </Button>
            )}

            {isExpired && (
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-md text-sm font-bold text-yellow-800 dark:text-yellow-300">
                  Your scheduled date has expired. Please pay and reschedule.
                </div>
                <Button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-payment', { detail: { action: 'schedule' } }))}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Pay & Reschedule
                </Button>
              </div>
            )}

            <button 
              onClick={() => setIsVisible(false)}
              className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors p-2 md:absolute md:top-1 md:right-1"
              title="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Premium Background Accents */}
          {isTestTime && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute -right-4 -top-8 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
              <div className="absolute right-0 bottom-0 top-0 w-1 bg-gradient-to-b from-red-400 via-red-500 to-red-400 animate-shimmer" style={{ backgroundSize: '100% 200%' }} />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Add these to global CSS or a separate file if needed
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }
