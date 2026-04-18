import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Star, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface BannerProps {
  status: string;
  onPay: () => void;
  onSchedule: () => void;
  scheduledTestDate?: string;
  scheduledTestSlot?: string;
  verifiedBadge?: boolean;
}


const statusText: Record<string, string> = {
  not_applied: 'Become a Verified Counsellor! Pay & Give Test.',
  payment_pending: 'Become a Verified Counsellor! Pay & Give Test.',
  test_pending: 'You can now take the verification test.',
  test_scheduled: 'Your test is scheduled. Please check your email for details.',
  verification_in_progress: 'Your verification is in progress.',
  verified: 'You are verified!',
  rejected: 'Your verification was rejected. Please contact support.',
};

import ScheduledTestTimer from './scheduled-test-timer';

const Banner: React.FC<BannerProps> = ({ status: propStatus, onPay, onSchedule, scheduledTestDate, scheduledTestSlot, verifiedBadge }) => {
  const router = useRouter();

  // A counselor is ONLY considered fully "Verified" for UI purposes if they have the verifiedBadge.
  // If they have status='verified' but no badge, we treat them as 'not_applied' so they can see payment buttons.
  const status = (propStatus === 'verified' && !verifiedBadge) ? 'not_applied' : propStatus;

  // Ensure we have the date/time for the timer/display
  const displayDate = scheduledTestDate || (typeof window !== 'undefined' ? localStorage.getItem('scheduledTestDate') : null);
  const displaySlot = scheduledTestSlot || (typeof window !== 'undefined' ? localStorage.getItem('scheduledTestSlot') : null);

  // If test is scheduled, show the timer instead of the banner UI
  if (status === 'test_scheduled' && displayDate) {
    return <ScheduledTestTimer date={displayDate} slot={displaySlot || undefined} />;
  }

  // Show payment/test buttons if NOT fully verified with a badge, AND not in the middle of a test/verification.
  const showPayButtons = !verifiedBadge && !['test_pending', 'test_scheduled', 'verification_in_progress', 'rejected'].includes(status);

  // Final status for config mapping
  const finalStatus = verifiedBadge ? 'verified' : status;

  const getStatusConfig = () => {
    switch (finalStatus) {
      case 'verified':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          title: 'Verified Counsellor',
          message: statusText['verified'],
          color: 'from-emerald-50 to-white border-emerald-200',
          textColor: 'text-emerald-900',
          badge: 'bg-emerald-100 text-emerald-700'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          title: 'Verification Rejected',
          message: statusText['rejected'],
          color: 'from-red-50 to-white border-red-200',
          textColor: 'text-red-900',
          badge: 'bg-red-100 text-red-700'
        };
      case 'verification_in_progress':
        return {
          icon: <Clock className="w-6 h-6 text-blue-500" />,
          title: 'Verification Ongoing',
          message: statusText['verification_in_progress'],
          color: 'from-blue-50 to-white border-blue-200',
          textColor: 'text-blue-900',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'test_pending':
        return {
          icon: <Star className="w-6 h-6 text-indigo-500 animate-pulse" />,
          title: 'Test Available!',
          message: statusText['test_pending'],
          color: 'from-indigo-50 via-white to-indigo-50/30 border-indigo-200',
          textColor: 'text-indigo-900',
          badge: 'bg-indigo-100 text-indigo-700'
        };
      case 'test_scheduled':
        return {
          icon: <Clock className="w-6 h-6 text-amber-500" />,
          title: 'Assessment Scheduled',
          message: statusText['test_scheduled'],
          color: 'from-amber-50 to-white border-amber-200',
          textColor: 'text-amber-900',
          badge: 'bg-amber-100 text-amber-700'
        };
      default:
        return {
          icon: <ShieldCheck className="w-6 h-6 text-orange-500" />,
          title: 'Get Verified',
          message: statusText['not_applied'],
          color: 'from-orange-50 via-white to-orange-50/30 border-orange-200',
          textColor: 'text-orange-900',
          badge: 'bg-orange-100 text-orange-700'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${config.color} border ${config.textColor} px-6 py-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-8 transition-all hover:shadow-md group`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />

      <div className="flex items-start gap-4 flex-1">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-inherit shrink-0">
          {config.icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg tracking-tight">{config.title}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badge}`}>
              Status: {propStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm opacity-80 max-w-xl leading-relaxed">
            {showPayButtons ? statusText['not_applied'] : (
              status === 'test_scheduled' && displayDate
                ? `Your assessment is scheduled for ${new Date(displayDate).toLocaleDateString()} at ${displaySlot || 'the chosen time'}.`
                : config.message
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {showPayButtons && (
          <>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 border-none transition-all hover:translate-y-[-2px] active:translate-y-0"
              onClick={onPay}
            >
              Pay & Give Test Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 transition-all"
              onClick={onSchedule}
            >
              Pay & Schedule
            </Button>
          </>
        )}

        {status === 'test_pending' && (
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 border-none transition-all hover:translate-y-[-2px]"
            onClick={() => router.push('/dashboard/test-guidance')}
          >
            Start Assessment Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        )}

        {finalStatus === 'verified' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Verified Profile
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
