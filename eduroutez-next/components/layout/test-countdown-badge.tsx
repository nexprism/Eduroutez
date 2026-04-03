'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Play, GraduationCap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestCountdownBadge() {
  const router = useRouter();
  const [testTime, setTestTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isTestTime, setIsTestTime] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client
    const checkTest = () => {
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);

      if (storedRole !== 'counsellor') return;

      const sd = localStorage.getItem('scheduledTestDate');
      const ss = localStorage.getItem('scheduledTestSlot');

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

      if (diff <= 0) {
        // Test time has passed (or is now)
        setIsTestTime(true);
        setTimeLeft(null);
        return;
      }

      // Within 10 minutes of test, we allow starting?
      if (diff < 10 * 60 * 1000) {
        setIsTestTime(true);
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

  if (!isVisible || role !== 'counsellor' || !testTime) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-1 flex items-center gap-4 overflow-hidden group">
          {/* Progress / Status Indicator */}
          <div className={`shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isTestTime ? 'bg-green-500 text-white animate-pulse' : 'bg-primary/10 text-primary'}`}>
            {isTestTime ? <Play className="h-8 w-8 fill-current" /> : <Clock className="h-8 w-8" />}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Certification Test</span>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            
            {isTestTime ? (
               <div className="mt-0">
                  <p className="text-sm font-extrabold text-slate-800">IT'S TEST TIME!</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs font-bold text-green-600 hover:text-green-700 underline underline-offset-4"
                    onClick={() => router.push('/dashboard/counselor-test')}
                  >
                    START YOUR ASSESSMENT NOW →
                  </Button>
               </div>
            ) : timeLeft ? (
              <div className="mt-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    {timeLeft.hours.toString().padStart(2, '0')}:
                    {timeLeft.minutes.toString().padStart(2, '0')}:
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">REMINDING</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate">Starts at {testTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ) : null}
          </div>

          {isTestTime && (
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
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
