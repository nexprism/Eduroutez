'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Clock, Play, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Option {
  _id: string;
  optionText: string;
}

interface Question {
  _id: string;
  questionText: string;
  options: Option[];
}

interface QuestionSet {
  _id: string;
  setName: string;
  questions: Question[];
  timeLimit: number;
  totalQuestions: number;
}

export default function CounselorTestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Check eligibility on mount
  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      // Check if they already have a result, if so redirect to test-result
      try {
        const resultResponse = await axiosInstance.get(`${API_URL}/counselor-test/get-result`);
        if (resultResponse.data?.success && resultResponse.data?.data) {
          router.push('/dashboard/test-result');
          return;
        }
      } catch (err) {
        // No result yet
      }

      const response = await axiosInstance.get(`${API_URL}/counselor-test/can-give`);
      setEligibility(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Eligibility check error:', error);
      toast.error('Failed to check eligibility');
      setIsLoading(false);
    }
  };

  const startTest = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`${API_URL}/counselor-test/questions`);
      const set = response.data.data;
      setQuestionSet(set);
      setTimeLeft(set.timeLimit * 60);
      setTestStarted(true);
      setIsLoading(false);
      toast.success('Test started! Good luck.');
    } catch (error) {
      console.error('Start test error:', error);
      toast.error('Failed to load questions');
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const submitTest = useCallback(async (isTimedOut = false) => {
    if (!questionSet || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        questionId: qId,
        selectedOptionId: oId
      }));

      const payload = {
        questionSetId: questionSet._id,
        answers: formattedAnswers,
        timeTaken: questionSet.timeLimit * 60 - timeLeft,
        isTimedOut
      };

      const response = await axiosInstance.post(`${API_URL}/counselor-test/submit`, payload);
      
      // Sync status to localStorage for the rest of the app
      if (response.data.data?.status === 'pass') {
        localStorage.setItem('verificationStatus', 'verified');
        if (response.data.data.verifiedBadge !== undefined) {
          localStorage.setItem('verifiedBadge', String(response.data.data.verifiedBadge));
        }
      } else {
        localStorage.setItem('verificationStatus', 'rejected');
      }

      // Clear scheduled test info
      localStorage.removeItem('scheduledTestDate');
      localStorage.removeItem('scheduledTestSlot');
      
      // Redirect to dedicated result page
      router.push('/dashboard/test-result');
      
      toast.success('Test submitted successfully!');

      // Sync status to localStorage for the rest of the app
      if (response.data.data?.status === 'pass') {
        localStorage.setItem('verificationStatus', 'verified');
        // If the API returns verifiedBadge, sync it too
        if (response.data.data.verifiedBadge !== undefined) {
          localStorage.setItem('verifiedBadge', String(response.data.data.verifiedBadge));
        }
      } else {
        localStorage.setItem('verificationStatus', 'rejected');
      }
    } catch (error) {
      console.error('Submit test error:', error);
      toast.error('Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  }, [questionSet, answers, timeLeft, isSubmitting]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && timeLeft > 0 && !testResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeLeft, testResult, submitTest]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[80dvh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  // Not Eligible Screen
  if (eligibility && !eligibility.eligible && !testStarted) {
    return (
      <div className="container max-w-2xl py-20 px-4 flex flex-col items-center">
        <div className="p-4 rounded-full bg-amber-500/10 mb-6">
          <AlertCircle className="h-12 w-12 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-4 text-foreground">Action Required</h1>
        <p className="text-muted-foreground text-lg text-center mb-8">
          {eligibility.reason || 'You are not eligible to take the test at this moment.'}
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/dashboard/profile">
            <Button variant="outline" className="rounded-xl px-8 border-red-100 text-red-700 hover:bg-red-50">
              Update Profile
            </Button>
          </Link>
          <Link href="/pricing">
            <Button className="rounded-xl px-8 bg-red-700 hover:bg-red-800 text-white shadow-lg shadow-red-900/10">
              Complete Payment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Question / Test UI
  if (testStarted && questionSet) {
    const currentQuestion = questionSet.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questionSet.questions.length) * 100;

    return (
      <div className="w-full max-w-7xl py-2 px-4 md:px-8 mx-auto flex flex-col min-h-screen">
        {/* Compact Header with Clock & Progress */}
        <div className="shrink-0 z-10 bg-background/50 backdrop-blur-md pb-2 pt-1">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-foreground">Question {currentQuestionIndex + 1}</span>
              <span className="text-muted-foreground text-sm">of {questionSet.questions.length}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-lg ${timeLeft < 120 ? 'bg-red-500/10 text-red-600 animate-pulse' : 'bg-muted text-foreground/80'}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={progress} className="h-1.5 rounded-full bg-muted" indicatorClassName="bg-red-600" />
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4 overflow-hidden">
          {/* Main Question Area */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col border border-border shadow-sm rounded-2xl overflow-hidden bg-card/70 backdrop-blur-md">
              <CardContent className="flex-1 overflow-y-auto p-5 md:p-7 pt-6">
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight mb-8">
                  {currentQuestion.questionText}
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option._id}
                      onClick={() => handleOptionSelect(currentQuestion._id, option._id)}
                      className={`group flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        answers[currentQuestion._id] === option._id 
                        ? 'border-red-600 bg-red-500/10 shadow-md transform scale-[1.002]' 
                        : 'border-border hover:border-muted hover:bg-muted/50'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                        answers[currentQuestion._id] === option._id 
                        ? 'border-red-600' 
                        : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'
                      }`}>
                         {answers[currentQuestion._id] === option._id && (
                           <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
                         )}
                      </div>
                      <span className={`text-base transition-colors ${
                        answers[currentQuestion._id] === option._id 
                        ? 'text-red-600 dark:text-red-400 font-bold' 
                        : 'text-foreground/80'
                      }`}>
                        {option.optionText}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="shrink-0 flex justify-between items-center py-4 bg-background/50">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-xl px-8 h-12 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex === questionSet.questions.length - 1 ? (
                <Button 
                  size="lg" 
                  className="rounded-xl px-10 h-12 bg-red-700 hover:bg-red-800 text-white font-bold shadow-lg shadow-red-900/10"
                  onClick={() => submitTest()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Finish Test'}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="rounded-xl px-10 h-12 bg-red-700 hover:bg-red-800 text-white font-bold shadow-lg shadow-red-900/10"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar Question Navigator */}
          <div className="hidden lg:flex flex-col space-y-4">
            <Card className="flex-1 flex flex-col border border-border shadow-sm rounded-2xl overflow-hidden bg-card/70 backdrop-blur-md">
              <CardHeader className="py-4 px-5 border-b border-border">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Test Navigation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-4 gap-2">
                  {questionSet.questions.map((q, idx) => (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        idx === currentQuestionIndex 
                        ? 'ring-2 ring-red-600 ring-offset-2 scale-110' 
                        : ''
                      } ${
                        answers[q._id] 
                        ? 'bg-red-600 text-white' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border space-y-3">
                   <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-red-600" />
                      <span>Answered ({Object.keys(answers).length})</span>
                   </div>
                   <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/60">
                      <div className="h-2 w-2 rounded-full bg-muted" />
                      <span>Remaining ({questionSet.questions.length - Object.keys(answers).length})</span>
                   </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-border">
                 <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Stability Check</p>
                    <p className="text-[9px] text-red-500/70 mt-1 leading-tight">Your connection is active. Do not refresh.</p>
                 </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Welcome / Instructions Screen
  return (
    <div className="w-full max-w-[1300px] px-4 md:px-6 mx-auto py-4 animate-in fade-in zoom-in duration-500">
      <Card className="w-full border border-border shadow-2xl shadow-red-950/20 rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-3xl">
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-red-600 to-red-500" />
        
        <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-border">
          {/* Left Column: Branding & Intro */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-sm">
                <GraduationCap className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">Counselor Certification</span>
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Assessment Portal</h1>
              </div>
            </div>
            
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg mb-8">
              Verify your expertise and earn your professional badge. This assessment measures your readiness for independent career advisory.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: '50 Questions', desc: 'MCQ Format', icon: HelpCircle },
                { title: '25 Minutes', desc: 'Auto-Submit', icon: Clock },
                { title: '50% to Pass', desc: 'Score 25+', icon: CheckCircle2 },
                { title: 'Single Attempt', desc: 'No Retakes', icon: AlertCircle }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border group transition-colors hover:bg-muted">
                  <div className="p-2 rounded-xl bg-card shadow-sm border border-border text-red-600">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm leading-tight">{item.title}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: CTA & Action Area */}
          <div className="xl:w-[450px] p-8 md:p-10 bg-muted/20 flex flex-col justify-center">
            <div className="relative overflow-hidden group rounded-3xl h-full flex flex-col justify-between">
               <div className="absolute inset-0 bg-red-700 opacity-[1]" />
               
               {/* Pattern overlay */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
               
               <div className="relative p-8 text-center flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[9px] font-bold uppercase tracking-widest mb-6">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-300 animate-pulse" />
                    Final Checklist Complete
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to start?</h3>
                  <p className="text-red-50/70 text-sm font-medium leading-relaxed mb-10">
                    Ensure a stable connection. The timer will start immediately after clicking the button below. Good luck!
                  </p>
                  
                  <Button 
                    onClick={startTest} 
                    className="bg-white text-red-700 hover:bg-neutral-50 px-10 py-7 text-xl font-black rounded-2xl w-full transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group/btn hover:shadow-red-900/40"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Setting up...' : 'Kick Off Test'}
                    <div className="transform transition-transform group-hover/btn:translate-x-1">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  </Button>
               </div>
               
               {/* Bottom Help Text */}
               <div className="relative p-6 text-center border-t border-white/10">
                  <p className="text-red-100/50 text-[10px] font-medium uppercase tracking-wider">
                     By starting, you agree to our certification terms.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="mt-6 flex justify-between items-center px-2">
         <p className="text-muted-foreground text-xs font-medium">
            Portal Version 2.0.4 &bull; Eduroutez Counselor Services
         </p>
         <button className="text-red-700 text-xs font-bold hover:underline">Contact Support</button>
      </div>
    </div>
  );
}

const GraduationCap = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);
