"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const GuidancePage: React.FC = () => {
  const router = useRouter();
  return (
    <div className="my-4 bg-blue-50 border border-blue-300 rounded p-6 max-w-2xl mx-auto flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Counselor Test</h2>
      <p className="mb-4 text-base text-gray-700 text-center">Please read these important instructions before starting your test. Following these will help you perform your best!</p>
      <ul className="mb-6 list-disc list-inside text-left text-gray-800">
        <li className="mb-1"><strong>Read Each Question Carefully:</strong> Take your time to understand what is being asked before answering.</li>
        <li className="mb-1"><strong>Manage Your Time:</strong> You have 25 minutes for all 50 questions. Don't spend too long on any one question.</li>
        <li className="mb-1"><strong>Stay Calm and Focused:</strong> If you don't know an answer, move on and return to it later if time allows.</li>
        <li className="mb-1"><strong>Review Your Answers:</strong> If you finish early, use the remaining time to check your answers.</li>
        <li className="mb-1"><strong>Stable Connection:</strong> A reliable connection is required to avoid interruptions and submit successfully.</li>
        <li className="mb-1"><strong>Device Readiness:</strong> Make sure your device is charged and notifications are silenced.</li>
        <li className="mb-1"><strong>Technical Support:</strong> If you face any technical issues, please contact our support team immediately.</li>
      </ul>
      <button className="bg-primary text-white px-8 py-2 rounded font-semibold text-lg" onClick={() => router.push('/dashboard/take-test')}>
        Start Test
      </button>
    </div>
  );
};

export default GuidancePage;
