'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Loader2, 
  Download,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

function TestResultContent() {
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/counselor-test/get-result`);
        if (response.data?.success && response.data?.data) {
          setTestResult(response.data.data);
        } else {
          setError('No test result found. Please take the test first.');
        }
      } catch (err) {
        console.error('Fetch result error:', err);
        setError('Failed to load test result. Please ensure you have completed the assessment.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-[70dvh] items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Analysing Results...</p>
      </div>
    );
  }

  if (error || !testResult) {
    return (
      <div className="container max-w-2xl py-20 px-4 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 mb-8"
        >
          <AlertCircle className="h-12 w-12 text-slate-400" />
        </motion.div>
        <h1 className="text-3xl font-black mb-4 text-slate-900 leading-tight">No Results Found</h1>
        <p className="text-slate-500 text-lg mb-10 font-medium max-w-md mx-auto leading-relaxed">
          {error || "It looks like you haven't taken the verification test yet. Complete the assessment to see your results."}
        </p>
        <Link href="/dashboard/test-benefits">
          <Button className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-xl shadow-red-200 transition-all hover:scale-105 active:scale-95">
            GO TO ASSESSMENT PORTAL
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  const isPass = testResult.status === 'pass';
  const accuracy = testResult.totalQuestions > 0 ? Math.round((testResult.score / testResult.totalQuestions) * 100) : 0;
  const timeStr = testResult.timeTaken >= 60 
    ? `${Math.floor(testResult.timeTaken / 60)}m ${testResult.timeTaken % 60}s` 
    : `${testResult.timeTaken || 0}s`;

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-7xl"
      >
        <Card className="w-full border border-red-100/50 shadow-2xl shadow-red-900/5 bg-white dark:bg-slate-900 overflow-hidden rounded-[2.5rem]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.6fr]">
            
            {/* Left Column: Context & Actions */}
            <div className="relative p-8 md:p-12 bg-gradient-to-br from-red-50/80 via-white to-transparent dark:from-red-950/20 dark:to-transparent flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-red-100/50">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <motion.div 
                  variants={itemVariants}
                  className="mx-auto lg:mx-0 mb-8 w-20 h-20 rounded-[1.5rem] bg-white dark:bg-slate-800 flex items-center justify-center shadow-xl shadow-red-200/20 border border-red-50"
                >
                  {isPass ? (
                    <Trophy className="h-10 w-10 text-red-600" />
                  ) : (
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  )}
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isPass ? 'text-red-600' : 'text-slate-400'} mb-3 block`}>
                    Assessment Completed
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                    {isPass ? 'Certification Success!' : 'Review in Progress'}
                  </h1>
                  <p className="text-sm md:text-base font-semibold text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-8">
                    {isPass 
                      ? 'Congratulations! You have successfully met the performance benchmarks for verified counselor status.'
                      : 'You have completed the assessment. Our team will review your performance shortly.'}
                  </p>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-8">
                 {isPass && (
                   <Button className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-xl shadow-red-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group">
                     DOWNLOAD CERTIFICATE
                     <Download className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                   </Button>
                 )}
                 <Link href="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full h-16 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                      <ArrowLeft className="h-5 w-5" />
                      BACK TO DASHBOARD
                    </Button>
                 </Link>
              </motion.div>
            </div>

            {/* Right Column: Analytics & Details */}
            <div className="p-8 md:p-12 bg-slate-50/20 dark:bg-slate-900/50 flex flex-col justify-center">
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                {[
                  { label: 'Total Score', value: testResult.score, sub: `out of ${testResult.totalQuestions}`, icon: <CheckCircle2 className="w-4 h-4" /> },
                  { label: 'Accuracy', value: `${accuracy}%`, sub: 'Overall Performance', icon: <Target className="w-4 h-4" /> },
                  { label: 'Time Spent', value: timeStr, sub: 'Attempt Time', icon: <Timer className="w-4 h-4" /> }
                ].map((metric, idx) => (
                  <motion.div 
                    key={idx}
                    variants={itemVariants}
                    className="p-6 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center"
                  >
                    <div className="mb-3 p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600">
                      {metric.icon}
                    </div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{metric.label}</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-0.5">{metric.value}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">{metric.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Detailed Answer Pills */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                 <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Correct</span>
                    </div>
                    <span className="text-xl font-black text-emerald-600">{testResult.answers?.filter((a: any) => a.isCorrect).length || 0}</span>
                 </div>
                 <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Incorrect</span>
                    </div>
                    <span className="text-xl font-black text-red-600">{testResult.answers?.filter((a: any) => !a.isCorrect).length || 0}</span>
                 </div>
              </motion.div>

              {/* Verified Badge Footer */}
              <motion.div variants={itemVariants} className="flex flex-col items-center sm:flex-row sm:justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Assessment Data</span>
                 </div>
                 <div className="flex flex-col items-center sm:items-end text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                   <span>Attempted on {testResult?.createdAt ? new Date(testResult.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                   <span className="opacity-60">{testResult?.createdAt ? new Date(testResult.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                 </div>
              </motion.div>
            </div>

          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function TestResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-[70dvh] items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Router Context...</p>
      </div>
    }>
      <TestResultContent />
    </Suspense>
  );
}
