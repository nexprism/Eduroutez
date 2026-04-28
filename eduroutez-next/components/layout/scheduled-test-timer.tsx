'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Timer, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ScheduledTestTimerProps {
  date: string;
  slot?: string;
  onPay?: () => void;
  onSchedule?: () => void;
}

export default function ScheduledTestTimer({ date, slot, onPay, onSchedule }: ScheduledTestTimerProps) {
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
  if (slot && slot.includes(':')) {
    const [hours, minutes] = slot.split(':').map(Number);
    testDate.setHours(hours, minutes, 0, 0);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysPast = (new Date().getTime() - testDate.getTime()) / msPerDay;
  const isExpiredLong = daysPast > 3; // more than 3 days past
  const isNowOrPast = new Date().getTime() >= testDate.getTime();

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(220,38,38,0.15)] bg-slate-950 text-white p-8 md:p-12 rounded-[2.5rem]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-red-600/5 rounded-full blur-[80px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest mb-2">
              <Bell className="w-4 h-4" />
              Assessment Protocol Active
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-none">
              Certification <span className="text-red-500">Assessment</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
              Your path to becoming an Eduroutez Certified Counsellor begins shortly. Please ensure a stable connection.
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl shadow-inner">
                <Calendar className="w-6 h-6 text-red-500" />
                <span className="font-bold text-lg">{testDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl shadow-inner">
                <Clock className="w-6 h-6 text-red-500" />
                <span className="font-bold text-lg">{slot || testDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col items-center gap-6">
            {isExpiredLong ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-[1.25rem] text-center min-w-[320px] flex flex-col items-center gap-4 border border-yellow-200 dark:border-yellow-700">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                  <Timer className="w-8 h-8 text-yellow-800 dark:text-yellow-200" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold">Scheduled assessment expired</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Your scheduled date has passed more than 3 days ago. Please pay and reschedule.</p>
                </div>
                <div className="w-full">
                  <Button
                    onClick={() => {
                      if (onSchedule) {
                        onSchedule();
                        return;
                      }
                      router.push('/dashboard/test-benefits');
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-12 rounded-xl shadow-md border-none"
                  >
                    Pay & Reschedule
                  </Button>
                </div>
              </div>
            ) : isNowOrPast ? (
              <div className="bg-gradient-to-b from-red-600 to-red-700 p-8 rounded-[2rem] text-center min-w-[320px] flex flex-col items-center gap-6 shadow-2xl shadow-red-500/30 border border-red-400/30 animate-pulse">
                <div className="p-4 bg-white/10 rounded-full">
                  <Timer className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black uppercase tracking-tighter">Portal Open</p>
                  <p className="text-red-100/80 text-sm font-bold">Your assessment window is active.</p>
                </div>
                {!isExpiredLong && (
                  <Button 
                    onClick={() => router.push('/dashboard/test-benefits')}
                    className="w-full bg-white text-red-600 hover:bg-slate-50 font-black h-14 rounded-2xl shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none text-lg group/btn"
                  >
                    Start Assessment Now
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="flex gap-4 md:gap-6">
                  <TimeUnit value={timeLeft.days} label="Days" />
                  <TimeUnit value={timeLeft.hours} label="Hours" />
                  <TimeUnit value={timeLeft.minutes} label="Mins" />
                  <TimeUnit value={timeLeft.seconds} label="Secs" />
                </div>
                  {!isExpiredLong && (
                    <div className="w-full">
                      <div className="text-center text-sm text-slate-500 px-4 py-3 bg-white/5 rounded-lg">
                        Start will be available when the portal opens.
                      </div>
                    </div>
                  )}
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
    <div className="flex flex-col items-center group">
      <div className="flex flex-col items-center bg-white/5 backdrop-blur-xl min-w-[80px] md:min-w-[90px] p-4 md:p-5 rounded-3xl border border-white/10 transition-all group-hover:bg-red-600/10 group-hover:border-red-600/30 group-hover:-translate-y-2 shadow-xl shadow-black/20">
        <span className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter leading-none mb-1">
          {value.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-red-500">
          {label}
        </span>
      </div>
    </div>
  );
}
