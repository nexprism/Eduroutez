"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Timer, 
  ShieldCheck, 
  CircleHelp, 
  Wifi, 
  Smartphone, 
  Headphones,
  ArrowRight,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const instructions = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Read Carefully",
    desc: "Take your time to understand each question fully before providing your answer."
  },
  {
    icon: <Timer className="w-5 h-5" />,
    title: "Time Management",
    desc: "You have 25 minutes for all 50 questions. Don't linger too long on one item."
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Stay Focused",
    desc: "Maintain your composure. If you don't know an answer, skip it and return later."
  },
  {
    icon: <CircleHelp className="w-5 h-5" />,
    title: "Review Opportunity",
    desc: "If you finish before the time is up, use the extra minutes to double-check."
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    title: "Stable Network",
    desc: "A reliable connection is essential to prevent interruptions during submission."
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: "Ready Your Device",
    desc: "Ensure your device is fully charged and all notifications are silenced."
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "Get Support",
    desc: "If technical glitches occur, reach out to our support team immediately."
  }
];

const GuidancePage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-red-100 dark:border-red-900/20 shadow-2xl shadow-red-500/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.8fr]">
            
            {/* Left Column: Branding & CTA */}
            <div className="relative p-8 md:p-12 bg-gradient-to-br from-red-50/80 via-white to-transparent dark:from-red-950/20 dark:to-transparent flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-red-100/50">
              <button 
                onClick={() => router.push('/dashboard/test-benefits')}
                className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 hover:text-red-600 transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                BACK
              </button>

              <div className="mt-12 lg:mt-0 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-14 h-14 bg-red-600 rounded-2xl mt-6 flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none mb-6">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-2">Certification Assessment</span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-[1.1] mb-4">Counselor<br className="hidden lg:block" /> Test</h1>
                <p className="max-w-xs text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                  Please review these vital instructions carefully before starting your assessment. Your performance matters!
                </p>
              </div>

              <div className="mt-10 lg:mt-0 flex flex-col items-center lg:items-start gap-5">
                <Button 
                  onClick={() => router.push('/dashboard/take-test')}
                  className="w-full py-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  START TEST
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                {/* <div className="flex items-center gap-2.5 opacity-60">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     Portal secure & ready
                   </p>
                </div> */}
              </div>
            </div>

            {/* Right Column: Instructions */}
            <div className="p-8 md:p-12 bg-slate-50/30 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-center">
                {instructions.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-red-200 dark:hover:border-red-800/50 hover:shadow-lg hover:shadow-red-500/5 transition-all group"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">{item.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</span>
                    </div>
                  </motion.div>
                ))}
                
                {/* Additional Info Card */}
                <div className="md:col-span-2 mt-2 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-red-400">Security Note</p>
                      <p className="text-[10px] text-slate-300">Browser activity is monitored for academic integrity.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GuidancePage;
