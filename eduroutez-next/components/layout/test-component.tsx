"use client";
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';


const TestComponent = ({ onTestComplete }) => {

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [testStarted, setTestStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [timeoutSubmit, setTimeoutSubmit] = useState(false);
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
      setTimeoutSubmit(true);
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
      // Prepare answers as required by backend
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
    return <div className="p-6 text-center">Loading test questions...</div>;
  }

  if (!eligibility.eligible) {
    return (
      <div className="bg-white border rounded-lg p-8 shadow-md max-w-xl mx-auto flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-amber-600">Action Required</h2>
        <div className="mb-6 text-gray-700 text-center text-lg">{eligibility.reason}</div>
        <Button onClick={() => window.location.href = '/dashboard/overview'} className="bg-primary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  // Timer display
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');



  if (!testStarted) {
    return (
      <div className="bg-white border rounded-lg p-6 shadow-md max-w-xl mx-auto flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Verification Test</h2>
        <div className="mb-4 text-gray-700 text-center">You have {Math.floor(timeLeft/60)} minutes to complete {questions.length} questions. Click below to begin.</div>
        <Button onClick={handleStart} className="bg-primary px-8 py-2 text-lg">Start Test</Button>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-md max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">Question {current + 1} of {questions.length}</div>
        <div className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">
          ⏰ {mins}:{secs}
        </div>
      </div>
      <div className="mb-4">
        <div className="font-medium mb-2 text-xl">{questions[current]?.questionText}</div>
        <div className="space-y-2">
          {questions[current]?.options.map((opt, optIdx) => (
            <label key={opt._id} className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${answers[current] === optIdx ? 'border-primary bg-primary/10' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name={`q${current}`}
                value={optIdx}
                checked={answers[current] === optIdx}
                onChange={() => handleOptionChange(current, optIdx)}
                disabled={submitting}
              />
              <span className="ml-2">{opt.optionText}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" onClick={handlePrev} disabled={current === 0 || submitting} className="px-6">Previous</Button>
        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              className={`w-8 h-8 rounded-full border text-xs font-bold ${idx === current ? 'bg-primary text-white' : answers[idx] !== null ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-300'}`}
              onClick={() => setCurrent(idx)}
              disabled={submitting}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        {current === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={submitting || answers.includes(null)} className="px-6 bg-primary">
            {submitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={current === questions.length - 1 || submitting} className="px-6">Next</Button>
        )}
      </div>
      {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
    </div>
  );
};

export default TestComponent;
