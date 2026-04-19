"use client";
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { 
  Timer, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  GraduationCap,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const TestComponent = ({ onTestComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [testStarted, setTestStarted] = useState(false);
  const [questionSetId, setQuestionSetId] = useState(null);
  const [totalTime, setTotalTime] = useState(0); // seconds
  const [eligibility, setEligibility] = useState({ eligible: true, reason: '' });
  const timerRef = useRef();

  useEffect(() => {
    const initTest = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Check if they already have a result
        try {
          const resultRes = await axiosInstance.get('/counselor-test/get-result');
          if (resultRes.data?.success && resultRes.data?.data) {
            window.location.href = '/dashboard/test-result';
            return;
          }
        } catch (e) {
          // No result found, proceed
        }

        // 2. Check if they are eligible
        const eligibilityRes = await axiosInstance.get('/counselor-test/can-give');
        setEligibility(eligibilityRes.data?.data || { eligible: false, reason: 'Failed to verify eligibility' });
        
        if (!eligibilityRes.data?.data?.eligible) {
          setLoading(false);
          return;
        }

        // 3. Fetch questions if eligible
        const { data } = await axiosInstance.get('/counselor-test/questions');
        const qs = data?.data?.questions || [];
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(null));
        const time = (data?.data?.timeLimit || 25) * 60;
        setTimeLeft(time);
        setTotalTime(time);
        setQuestionSetId(data?.data?._id || null);
      } catch (err) {
        setError('Failed to initialize test.');
      }
      setLoading(false);
    };
    initTest();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;
    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [testStarted, timeLeft]);

  // Auto-submit on timer end
  useEffect(() => {
    if (testStarted && timeLeft === 0) {
      handleSubmit(true);
    }
    // eslint-disable-next-line
  }, [timeLeft]);

  const handleOptionChange = (qIdx, optIdx) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
  };
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleStart = () => {
    setTestStarted(true);
  };

  const handleSubmit = async (isTimeout = false) => {
    setSubmitting(true);
    setError(null);
    try {
      const formattedAnswers = questions.map((q, idx) => ({
        questionId: q._id,
        selectedOptionId: q.options[answers[idx]]?._id || null
      }));
      const payload = {
        questionSetId: questionSetId,
        timeTaken: totalTime - timeLeft,
        isTimedOut: !!isTimeout,
        answers: formattedAnswers
      };
      await axiosInstance.post('/counselor-test/submit', payload);
      window.location.href = '/dashboard/test-result';
    } catch (err) {
      setError('Submission failed. Try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Initializing Assessment...</p>
      </div>
    );
  }

  if (!eligibility.eligible) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/20 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center max-w-xl mx-auto"
      >
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Action Required</h2>
        <p className="mb-8 text-slate-500 dark:text-slate-400 text-lg leading-relaxed">{eligibility.reason}</p>
        <Button 
          onClick={() => window.location.href = '/dashboard/overview'} 
          className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-10 py-7 text-lg font-bold shadow-xl shadow-red-200"
        >
          Back to Dashboard
        </Button>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center flex flex-col items-center gap-4">
        <XCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-bold text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Retry Load</Button>
      </div>
    );
  }

  // Timer display
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const isTimeLow = timeLeft < 300; // 5 minutes

  if (!testStarted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-red-500/5 max-w-2xl mx-auto"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-red-200 dark:shadow-none mb-6">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-2">Final Certification</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">Verification Test</h2>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-10 w-full border border-slate-100 dark:border-slate-800">
             <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
               You have <span className="text-red-600 font-black">{Math.floor(totalTime/60)} minutes</span> to complete 
               <span className="text-red-600 font-black"> {questions.length} {questions.length === 1 ? 'question' : 'questions'}</span>. 
               Click below to begin your official assessment.
             </p>
          </div>

          <div className="flex flex-col w-full gap-4">
            <Button 
              onClick={handleStart} 
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-8 text-xl font-black shadow-2xl shadow-red-200 dark:shadow-none relative group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                START TEST NOW
                <ArrowRight className="w-6 h-6 transform transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
            
            <div className="flex items-center justify-center gap-4 opacity-40">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Secure Environment
               </div>
               <div className="w-1 h-1 rounded-full bg-slate-400" />
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Timer className="w-3.5 h-3.5" />
                  Auto-Submit Enabled
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
      {/* Test Header */}
      <div className="mb-8 bg-white dark:bg-slate-900 sticky top-4 z-20 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-xl shadow-slate-200/20 backdrop-blur-md bg-white/90">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">Question {current + 1}</span>
              <span className="text-slate-400 font-bold">of {questions.length}</span>
            </div>
          </div>
          
          <div className={`flex flex-col items-end`}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Time Remaining</span>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl font-black text-lg ${isTimeLow ? 'bg-red-50 text-red-600 animate-pulse border border-red-100' : 'bg-slate-50 text-slate-700'}`}>
              <Timer className="w-5 h-5" />
              <span className="tabular-nums">{mins}:{secs}</span>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2 rounded-full bg-slate-100" indicatorClassName="bg-red-600 transition-all duration-500" />
      </div>

      {/* Question Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/10 mb-8"
        >
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-[1.2]">
              {questions[current]?.questionText}
            </h3>
          </div>

          <div className="space-y-4">
            {questions[current]?.options.map((opt, optIdx) => (
              <label 
                key={opt._id} 
                className={`group flex items-center gap-4 p-5 rounded-3xl cursor-pointer border-2 transition-all duration-200 ${
                  answers[current] === optIdx 
                  ? 'border-red-600 bg-red-50/30 dark:bg-red-950/20 shadow-lg shadow-red-200/20' 
                  : 'border-slate-50 dark:border-slate-800 hover:border-red-200 hover:bg-red-50/10'
                }`}
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <input
                    type="radio"
                    className="sr-only"
                    name={`q${current}`}
                    value={optIdx}
                    checked={answers[current] === optIdx}
                    onChange={() => handleOptionChange(current, optIdx)}
                    disabled={submitting}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    answers[current] === optIdx 
                    ? 'border-red-600' 
                    : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    {answers[current] === optIdx && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 rounded-full bg-red-600" 
                      />
                    )}
                  </div>
                </div>
                <span className={`text-lg font-semibold transition-colors ${
                  answers[current] === optIdx 
                  ? 'text-red-700 dark:text-red-400' 
                  : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {opt.optionText}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl gap-6">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={current === 0 || submitting} 
          className="w-full md:w-auto rounded-2xl h-14 px-8 border-slate-200 font-bold hover:bg-slate-50"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Previous
        </Button>

        <div className="flex flex-wrap justify-center gap-2 max-w-md">
          {questions.map((_, idx) => (
            <button
              key={idx}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                idx === current 
                ? 'bg-red-600 text-white ring-4 ring-red-100 ring-offset-2' 
                : answers[idx] !== null 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-200'
              }`}
              onClick={() => setCurrent(idx)}
              disabled={submitting}
            >
              {(idx + 1).toString().padStart(2, '0')}
            </button>
          ))}
        </div>

        {current === questions.length - 1 ? (
          <Button 
            onClick={() => handleSubmit()} 
            disabled={submitting || answers.includes(null)} 
            className="w-full md:w-auto rounded-2xl h-14 px-10 bg-red-600 hover:bg-red-700 text-white font-black shadow-xl shadow-red-200 dark:shadow-none flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {submitting ? 'Submitting...' : 'Finish Test'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            disabled={submitting} 
            className="w-full md:w-auto rounded-2xl h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-2"
          >
            Next Question
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center font-bold text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

const XCircle = (props: any) => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export default TestComponent;
