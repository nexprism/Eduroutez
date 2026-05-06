'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Target, 
  FileText,
  Calendar,
  Clock,
  ShieldCheck,
  Download,
  Trophy as TrophyIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axiosInstance from '@/lib/axios';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
          if (response.data.data.status === 'pass') {
            triggerConfetti();
          }
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

  const triggerConfetti = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 50 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 60 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[80dvh] items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Assessment Results...</p>
      </div>
    );
  }

  if (error || !testResult) {
    return (
      <div className="container max-w-2xl py-20 px-4 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 mb-8">
          <TrophyIcon className="h-16 w-16 text-slate-300" />
        </motion.div>
        <h1 className="text-3xl font-black mb-4 text-slate-900 leading-tight">No Results Found</h1>
        <p className="text-slate-500 text-lg mb-10 font-medium max-w-md mx-auto leading-relaxed">{error}</p>
        <Link href="/dashboard/test-benefits">
          <Button className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-xl">GO TO ASSESSMENT PORTAL</Button>
        </Link>
      </div>
    );
  }

  const isPass = testResult.status === 'pass';
  const attempted = testResult.answers?.length || 0;
  const correct = testResult.answers?.filter((a: any) => a.isCorrect).length || 0;
  const incorrect = testResult.answers?.filter((a: any) => !a.isCorrect).length || 0;
  const percentage = testResult.totalQuestions > 0 ? Math.round((testResult.score / testResult.totalQuestions) * 100) : 0;
  const timeStr = testResult.timeTaken >= 60 ? `${Math.floor(testResult.timeTaken / 60)}m ${testResult.timeTaken % 60}s` : `${testResult.timeTaken || 0}s`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-2 md:p-6 lg:p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1200px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col"
      >
        {/* Top Banner Section */}
        <div className="w-full bg-gradient-to-r from-[#F9F9FF] via-[#FDFDFF] to-[#F9F9FF] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative border-b border-slate-50">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 z-10">
            <div className="relative w-32 h-32 md:w-44 md:h-44">
               <Image src="/trophy.png" alt="Trophy" fill className="object-contain" />
            </div>
            
            <div className="text-center md:text-left space-y-3">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Congratulations! 🎊</h1>
              <p className="text-xl md:text-2xl font-bold text-indigo-600">
                {isPass ? 'You did a great job!' : 'You have completed the assessment!'}
              </p>
              <p className="text-slate-500 font-medium max-w-md text-base leading-relaxed">
                {isPass 
                  ? "You've completed the assessment with a strong performance. Keep shining and inspiring more students!" 
                  : "Thank you for completing the verification test. Our team will review your application shortly."}
              </p>
            </div>
          </div>

          <div className="mt-10 md:mt-0 flex-shrink-0 relative w-32 h-32 md:w-40 md:h-40">
             <Image src="/certi.png" alt="Performance Badge" fill className="object-contain" />
          </div>
          
          {/* Subtle Confetti Background Elements */}
          <div className="absolute top-10 right-20 w-3 h-3 bg-red-400 rounded-sm rotate-45 opacity-20" />
          <div className="absolute bottom-10 left-40 w-3 h-3 bg-indigo-400 rounded-full opacity-20" />
          <div className="absolute top-20 left-1/2 w-2 h-2 bg-yellow-400 rotate-12 opacity-20" />
        </div>

        {/* Main Content Area: Split Layout */}
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Column: Status & Navigation */}
          <div className="w-full lg:w-[35%] p-8 md:p-12 flex flex-col items-center lg:items-start text-center lg:text-left justify-between border-b lg:border-b-0 lg:border-r border-slate-50">
            <div className="space-y-8 flex flex-col items-center lg:items-start">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center p-5 border border-slate-100 shadow-sm shadow-slate-100">
                 <Image src="/images/assessment/completed-icon.png" alt="Status" width={40} height={40} className="object-contain" />
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Assessment Completed</p>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {testResult.adminVerified ? 'Verification Complete!' : (isPass ? 'Certification Success!' : 'Review in Progress')}
                </h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                  {testResult.adminVerified 
                    ? 'Your verification has been processed. You can now access all counselor features.' 
                    : 'You have completed the assessment. Our team will review your performance and documents shortly.'}
                </p>
              </div>
            </div>

            <div className="mt-12 space-y-4 w-full">
              {isPass && (
                <Button className="w-full h-14 rounded-2xl bg-[#E11D48] hover:bg-red-700 text-white font-black shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                  DOWNLOAD CERTIFICATE
                  <Download className="h-5 w-5" />
                </Button>
              )}
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  BACK TO DASHBOARD
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Data Visualization */}
          <div className="w-full lg:w-[65%] p-8 md:p-12 flex flex-col space-y-10">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Questions', value: testResult.totalQuestions, icon: <FileText className="w-5 h-5" />, color: 'indigo' },
                { label: 'Attempted', value: attempted, icon: <Target className="w-5 h-5" />, color: 'emerald' },
                { label: 'Correct', value: correct, icon: <CheckCircle2 className="w-5 h-5" />, color: 'emerald' },
                { label: 'Incorrect', value: incorrect, icon: <XCircle className="w-5 h-5" />, color: 'rose' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 flex flex-col items-center text-center border border-slate-100 shadow-sm">
                  <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 mb-4`}>
                    {stat.icon}
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">OUT OF {testResult.totalQuestions}</p>
                </div>
              ))}
            </div>

            {/* Score Summary Wide Card */}
            <div className="bg-[#F9FAFF] rounded-[2rem] p-8 md:p-10 border border-slate-100 grid grid-cols-1 md:grid-cols-[0.6fr,1fr,1.4fr] items-center gap-8 md:gap-0">
              <div className="flex justify-center md:justify-start">
                <div className="w-20 h-20 relative p-4 bg-white rounded-full shadow-lg shadow-indigo-100 border border-indigo-50 flex items-center justify-center">
                   <TrophyIcon className="w-10 h-10 text-indigo-600" />
                </div>
              </div>

              <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Total Score</p>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{testResult.score}</span>
                  <span className="text-slate-400 font-bold uppercase text-xs">Out of {testResult.totalQuestions}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-6 pl-0 md:pl-10">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Score in Percentage</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">{percentage}%</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Overall Performance</p>
                </div>
                
                <div className="relative w-28 h-14 overflow-hidden">
                  <svg viewBox="0 0 100 50" className="w-full h-full rotate-0">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
                    <path 
                      d="M 10 50 A 40 40 0 0 1 90 50" 
                      fill="none" 
                      stroke="#4F46E5" 
                      strokeWidth="12" 
                      strokeLinecap="round"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 * (1 - percentage / 100)}
                    />
                  </svg>
                  <div className="absolute bottom-0 left-0 w-full text-center">
                    <span className="text-lg font-black text-slate-900">{percentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Row */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-slate-50 gap-6">
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/30">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Assessment Data</span>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Attempted on {testResult?.createdAt ? new Date(testResult.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">|</div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{testResult?.createdAt ? new Date(testResult.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export default function TestResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-[80dvh] items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Router Context...</p>
      </div>
    }>
      <TestResultContent />
    </Suspense>
  );
}
