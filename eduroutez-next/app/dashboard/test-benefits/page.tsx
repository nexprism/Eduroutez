"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Award, 
  Users, 
  Target, 
  BarChart3, 
  Sparkles, 
  IndianRupee,
  ArrowRight,
  ArrowLeft,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: <Award className="w-5 h-5" />,
    title: "Verified Badge",
    desc: "Gain instant trust with a verified professional badge on your profile."
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Priority Leads",
    desc: "Get first access to students actively seeking career guidance and support."
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Professional Branding",
    desc: "A high-impact profile listed across the Eduroutez platform ecosystem."
  },
  {
    icon: <IndianRupee className="w-5 h-5" />,
    title: "Fee Management",
    desc: "Seamlessly handle consultation fees and track your earned commissions."
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Advanced Analytics",
    desc: "Comprehensive tools to track student progress and your own performance."
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Premium Content",
    desc: "Unlock exclusive resources and training modules only for verified counselors."
  }
];

const BenefitsPage: React.FC = () => {
  const router = useRouter();

  React.useEffect(() => {
    // Prevent direct access via URL if user is not eligible
    try {
      const role = localStorage.getItem('role');
      const status = localStorage.getItem('verificationStatus');
      const sd = localStorage.getItem('scheduledTestDate');
      const ss = localStorage.getItem('scheduledTestSlot');

      if (role !== 'counsellor') {
        router.replace('/dashboard/overview');
        return;
      }

      if (status === 'test_pending') return; // allowed

      if (status === 'test_scheduled' && sd) {
        const date = new Date(sd);
        if (ss && ss.includes(':')) {
          const [h, m] = ss.split(':').map(Number);
          date.setHours(h, m, 0, 0);
        }
        const now = Date.now();
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysPast = (now - date.getTime()) / msPerDay;
        // allow only if portal is open (now >= date) and not expired >3 days
        if (now >= date.getTime() && daysPast <= 3) return;
      }

      // otherwise redirect to overview
      router.replace('/dashboard/overview');
    } catch (err) {
      router.replace('/dashboard/overview');
    }
  }, [router]);

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
            
            {/* Left Column: Enrollment Value */}
            <div className="relative p-8 md:p-12 bg-gradient-to-br from-red-50/80 via-white to-transparent dark:from-red-950/20 dark:to-transparent flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-red-100/50">
              <button 
                onClick={() => router.push('/dashboard/overview')}
                className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 hover:text-red-600 transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                DASHBOARD
              </button>

              <div className="mt-12 lg:mt-0 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none mb-6">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-2">Exclusive Enrollment</span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-[1.1] mb-4">Elevate Your<br className="hidden lg:block" /> Professionalism</h1>
                <p className="max-w-xs text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                  Join our elite circle of verified career experts and unlock powerful tools designed to scale your counseling impact.
                </p>
              </div>

              <div className="mt-10 lg:mt-0 flex flex-col items-center lg:items-start gap-5">
                <Button 
                  onClick={() => router.push('/dashboard/test-guidance')}
                  className="w-full py-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  NEXT: TEST GUIDANCE
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left leading-relaxed">
                  Take the first step towards <br /> professional certification
                </p>
              </div>
            </div>

            {/* Right Column: Key Benefits */}
            <div className="p-8 md:p-12 bg-slate-50/30 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-center">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-red-200 dark:hover:border-red-800/50 hover:shadow-xl hover:shadow-red-500/5 transition-all group lg:min-h-[120px] items-center"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 transition-transform group-hover:rotate-[10deg] group-hover:scale-110">
                      {benefit.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">{benefit.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{benefit.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BenefitsPage;
