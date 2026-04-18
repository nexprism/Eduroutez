'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Timer, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ScheduledTestTimerProps {
  date: string;
  slot?: string;
}

export default function ScheduledTestTimer({ date, slot }: ScheduledTestTimerProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let target = new Date(date).getTime();
    
    // If slot is provided, update the target time's hours and minutes
    if (slot && slot.includes(':')) {
      const [hours, minutes] = slot.split(':').map(Number);
      const testDate = new Date(date);
      testDate.setHours(hours, minutes, 0, 0);
      target = testDate.getTime();
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [date, slot]);

  if (!isClient) return null;

  const testDate = new Date(date);
  const isExpired = new Date().getTime() > testDate.getTime();

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-top duration-700">
      <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-6 md:p-8">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4">
              <Bell className="w-3 h-3" />
              Assessment Scheduled
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Guidance Test</h2>
            <p className="text-indigo-100 text-lg opacity-90 max-w-md">
              Your counsellor verification assessment is scheduled. Prepare well to get your verified badge!
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <Calendar className="w-5 h-5 text-indigo-200" />
                <span className="font-semibold">{testDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <Clock className="w-5 h-5 text-indigo-200" />
                <span className="font-semibold">{slot || testDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-center">
            {isExpired ? (
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl text-center min-w-[300px] flex flex-col items-center gap-4 border border-white/30">
                <Timer className="w-10 h-10 text-white animate-pulse" />
                <div className="space-y-1">
                  <p className="text-2xl font-bold uppercase tracking-tight">Test Time!</p>
                  <p className="text-indigo-100 text-sm">Your scheduled assessment window is now open.</p>
                </div>
                <Button 
                   onClick={() => router.push('/dashboard/counselor-test')}
                   className="w-full bg-white text-purple-600 hover:bg-white/90 font-bold h-12 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 border-none"
                 >
                   Start Assessment Now
                 </Button>
              </div>
            ) : (
              <div className="flex gap-2 md:gap-4">
                <TimeUnit value={timeLeft.days} label="Days" />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <TimeUnit value={timeLeft.minutes} label="Mins" />
                <TimeUnit value={timeLeft.seconds} label="Secs" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur-md min-w-[70px] md:min-w-[80px] p-2 md:p-3 rounded-2xl border border-white/20 transition-transform hover:scale-105">
      <span className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter leading-none mb-1">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-indigo-200">
        {label}
      </span>
    </div>
  );
}
