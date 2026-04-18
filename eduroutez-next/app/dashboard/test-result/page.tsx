'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TestResultPage() {
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
      <div className="flex h-[80dvh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !testResult) {
    return (
      <div className="container max-w-2xl py-20 px-4 flex flex-col items-center text-center">
        <div className="p-4 rounded-full bg-slate-50 mb-6">
          <AlertCircle className="h-12 w-12 text-slate-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">No Results Yet</h1>
        <p className="text-slate-600 text-lg mb-8">
          {error || "It looks like you haven't taken the verification test yet."}
        </p>
        <Link href="/dashboard/counselor-test">
          <Button className="rounded-xl px-8 bg-red-700 hover:bg-red-800 text-white shadow-lg">
            Go to Assessment Portal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 px-4 flex flex-col items-center animate-in fade-in duration-500">
      <Card className="w-full border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
        <div className={`h-3 w-full ${testResult.status === 'pass' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <CardHeader className="text-center pt-10 pb-2">
          <div className="mx-auto mb-6 p-4 rounded-3xl bg-slate-50 w-fit shadow-inner">
            {testResult.status === 'pass' ? (
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-rose-500" />
            )}
          </div>
          <CardTitle className="text-4xl font-black tracking-tight text-slate-900">
            {testResult.score >= testResult.totalQuestions / 2 ? 'Assessment Completed' : 'Assessment Completed'}
          </CardTitle>
          <CardDescription className="text-xl mt-3 font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
            {testResult.score >= testResult.totalQuestions / 2 
              ? 'Great job! You have reached the required performance level for certification.'
              : 'You have completed the assessment. Our team will review your responses shortly.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-indigo-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative bg-white p-8 rounded-[2rem] border border-slate-100 text-center transition-all hover:translate-y-[-4px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Total Score</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">{testResult.score}</div>
               </div>
            </div>

            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative bg-white p-8 rounded-[2rem] border border-slate-100 text-center transition-all hover:translate-y-[-4px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Accuracy</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">
                    {testResult.totalQuestions > 0 ? Math.round((testResult.score / testResult.totalQuestions) * 100) : 0}%
                  </div>
               </div>
            </div>

            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative bg-white p-8 rounded-[2rem] border border-slate-100 text-center transition-all hover:translate-y-[-4px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Time Spent</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">
                    {testResult.timeTaken >= 60 
                      ? `${Math.floor(testResult.timeTaken / 60)}m` 
                      : `${testResult.timeTaken}s`}
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
             <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-800">Correct Answers</span>
                <span className="text-2xl font-black text-emerald-600">{testResult.answers?.filter((a: any) => a.isCorrect).length || 0}</span>
             </div>
             <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                <span className="text-sm font-bold text-rose-800">Incorrect Answers</span>
                <span className="text-2xl font-black text-rose-600">{testResult.answers?.filter((a: any) => !a.isCorrect).length || 0}</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-6 pt-4">
             <div className="flex flex-wrap justify-center gap-4">
               <Link href="/dashboard">
                 <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                   <ArrowLeft className="mr-2 h-5 w-5" />
                   Back to Dashboard
                 </Button>
               </Link>
               {testResult.score >= testResult.totalQuestions / 2 && (
                 <Button className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                   Download Certificate
                 </Button>
               )}
             </div>
             
             <p className="text-slate-400 text-xs font-medium">
               Attempted on {new Date(testResult.createdAt).toLocaleDateString('en-US', { 
                 day: 'numeric', 
                 month: 'long', 
                 year: 'numeric',
                 hour: '2-digit',
                 minute: '2-digit'
               })}
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
