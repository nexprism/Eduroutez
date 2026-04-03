'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
      setTestResult(response.data.data);
      toast.success('Test submitted successfully!');
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

  // Final Results Screen
  if (testResult) {
    return (
      <div className="container max-w-4xl py-10 px-4 flex flex-col items-center">
         <Card className="w-full border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in zoom-in duration-300">
            <div className={`h-2 w-full ${testResult.status === 'pass' ? 'bg-green-500' : 'bg-red-500'}`} />
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 p-3 rounded-full bg-slate-50 w-fit">
                {testResult.status === 'pass' ? (
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                )}
              </div>
              <CardTitle className="text-3xl font-bold">
                {testResult.status === 'pass' ? 'Congratulations!' : 'Test Completed'}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {testResult.status === 'pass' 
                  ? 'You have successfully passed the Counselor Certification Test.'
                  : 'You did not reach the required passing score.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-50 text-center border border-slate-100">
                     <div className="text-sm font-medium text-slate-500 mb-1">Score</div>
                     <div className="text-4xl font-bold text-slate-900">{testResult.score}/{testResult.totalQuestions}</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 text-center border border-slate-100">
                     <div className="text-sm font-medium text-slate-500 mb-1">Accuracy</div>
                     <div className="text-4xl font-bold text-slate-900">
                        {Math.round((testResult.score / testResult.totalQuestions) * 100)}%
                     </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 text-center border border-slate-100">
                     <div className="text-sm font-medium text-slate-500 mb-1">Time Taken</div>
                     <div className="text-4xl font-bold text-slate-900">{Math.floor(testResult.timeTaken / 60)}m</div>
                  </div>
               </div>

               <div className="flex flex-col gap-3 pt-4 items-center">
                  {testResult.status === 'pass' ? (
                    <Button onClick={() => router.push('/dashboard')} className="w-full md:w-fit px-8 py-6 text-lg rounded-xl">
                      Go to Dashboard
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-4 w-full">
                       <p className="text-center text-slate-500 text-sm">
                         Don't worry! You can retake the test after renewing your application fee.
                       </p>
                       <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full rounded-xl">
                         Return to Dashboard
                       </Button>
                    </div>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
    );
  }

  // Not Eligible Screen
  if (eligibility && !eligibility.eligible && !testStarted) {
    return (
      <div className="container max-w-2xl py-20 px-4 flex flex-col items-center">
        <div className="p-4 rounded-full bg-amber-50 mb-6">
          <AlertCircle className="h-12 w-12 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-4">Action Required</h1>
        <p className="text-slate-600 text-lg text-center mb-8">
          {eligibility.reason || 'You are not eligible to take the test at this moment.'}
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <Button onClick={() => router.push('/dashboard/profile')} variant="outline" className="rounded-xl px-8">
            Update Profile
          </Button>
          <Button onClick={() => router.push('/pricing')} className="rounded-xl px-8">
            Complete Payment
          </Button>
        </div>
      </div>
    );
  }

  // Question / Test UI
  if (testStarted && questionSet) {
    const currentQuestion = questionSet.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questionSet.questions.length) * 100;

    return (
      <div className="container max-w-5xl py-8 px-4 min-h-screen">
        {/* Sticky Header with Clock & Progress */}
        <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md pb-4 pt-2">
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-slate-800">Q{currentQuestionIndex + 1}</span>
              <span className="text-slate-400">of {questionSet.questions.length}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xl ${timeLeft < 120 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-slate-800 leading-snug mb-10">
                  {currentQuestion.questionText}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option._id}
                      onClick={() => handleOptionSelect(currentQuestion._id, option._id)}
                      className={`group flex items-center p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                        answers[currentQuestion._id] === option._id 
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' 
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                        answers[currentQuestion._id] === option._id 
                        ? 'border-primary' 
                        : 'border-slate-300 group-hover:border-slate-400'
                      }`}>
                         {answers[currentQuestion._id] === option._id && (
                           <div className="h-3 w-3 rounded-full bg-primary" />
                         )}
                      </div>
                      <span className={`text-lg transition-colors ${
                        answers[currentQuestion._id] === option._id 
                        ? 'text-primary font-medium' 
                        : 'text-slate-700'
                      }`}>
                        {option.optionText}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-6">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-xl px-8"
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </Button>

              {currentQuestionIndex === questionSet.questions.length - 1 ? (
                <Button 
                  size="lg" 
                  className="rounded-xl px-8 bg-green-600 hover:bg-green-700"
                  onClick={() => submitTest()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Finish Test'}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="rounded-xl px-8"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Next
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar Question Navigator */}
          <div className="hidden lg:block space-y-6">
            <Card className="border-none shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Test Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questionSet.questions.map((q, idx) => (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        idx === currentQuestionIndex 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : ''
                      } ${
                        answers[q._id] 
                        ? 'bg-primary text-white' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                   <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <div className="h-3 w-3 rounded bg-primary" />
                      <span>Answered ({Object.keys(answers).length})</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="h-3 w-3 rounded bg-slate-100" />
                      <span>Remaining ({questionSet.questions.length - Object.keys(answers).length})</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Welcome / Instructions Screen
  return (
    <div className="container max-w-4xl py-12 px-4 flex flex-col items-center">
      <Card className="w-full border-none shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-white to-slate-50">
        <div className="h-3 w-full bg-primary/20" />
        <CardHeader className="text-center pt-10 px-10">
          <div className="mx-auto mb-6 p-4 rounded-3xl bg-primary/10 w-fit">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Counselor Certification Test
          </CardTitle>
          <CardDescription className="text-xl mt-4 text-slate-600">
            Verify your expertise and earn your professional counselor badge.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-10">
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-5">
                <div className="shrink-0 h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <HelpCircle className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">50 Questions</h4>
                  <p className="text-slate-500 mt-1">Multiple choice questions covering career advisory topics.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="shrink-0 h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                   <Clock className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">25 Minutes</h4>
                  <p className="text-slate-500 mt-1">Automated timer will end the test upon completion.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="shrink-0 h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                   <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">50% to Pass</h4>
                  <p className="text-slate-500 mt-1">Score at least 25 points to be eligible for certification.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="shrink-0 h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                   <AlertCircle className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">Single Attempt</h4>
                  <p className="text-slate-500 mt-1">Ensure a stable connection before starting your test.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Play className="h-32 w-32" />
               </div>
               <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
               <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-lg">
                 By clicking below, you acknowledge that you are ready to take the assessment. 
                 The timer will start immediately after the questions are loaded.
               </p>
               <Button 
                 onClick={startTest} 
                 className="bg-white text-slate-900 hover:bg-slate-100 px-10 py-7 text-xl font-bold rounded-2xl w-full md:w-auto transition-transform hover:scale-105 active:scale-95 shadow-lg"
                 disabled={isLoading}
               >
                 {isLoading ? 'Setting up...' : 'Kick Off Test'}
                 <ArrowRight className="ml-2 h-6 w-6 font-bold" />
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
