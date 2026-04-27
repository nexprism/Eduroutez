import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Star, Clock, AlertCircle, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerProps {
  status: string;
  onPay: () => void;
  onSchedule: () => void;
  scheduledTestDate?: string;
  scheduledTestSlot?: string;
  verifiedBadge?: boolean;
}

const statusText: Record<string, string> = {
  not_applied: 'Become a Verified Counsellor to gain trust and unlock premium features.',
  payment_pending: 'Complete your payment to unlock the verification assessment.',
  test_pending: 'The portal is open! You can now take the verification assessment.',
  test_scheduled: 'Your assessment is scheduled. Prepare well to get your badge!',
  verification_in_progress: 'We are currently reviewing your assessment results.',
  verified: 'Your profile is fully verified. You are now an Eduroutez Certified Counsellor!',
  rejected: 'Your verification was unsuccessful. Please reach out to support for guidance.',
};

import ScheduledTestTimer from './scheduled-test-timer';

const Banner: React.FC<BannerProps> = ({ status: propStatus, onPay, onSchedule, scheduledTestDate, scheduledTestSlot, verifiedBadge }) => {
  const router = useRouter();

  // A counselor is ONLY considered fully "Verified" for UI purposes if they have the verifiedBadge.
  const status = (propStatus === 'verified' && !verifiedBadge) ? 'not_applied' : propStatus;

  const displayDate = scheduledTestDate || (typeof window !== 'undefined' ? localStorage.getItem('scheduledTestDate') : null);
  const displaySlot = scheduledTestSlot || (typeof window !== 'undefined' ? localStorage.getItem('scheduledTestSlot') : null);

  if (status === 'test_scheduled' && displayDate) {
    return <ScheduledTestTimer date={displayDate} slot={displaySlot || undefined} />;
  }

  const showPayButtons = !verifiedBadge && !['test_pending', 'test_scheduled', 'verification_in_progress', 'rejected'].includes(status);
  const finalStatus = verifiedBadge ? 'verified' : status;

  const getStatusConfig = () => {
    switch (finalStatus) {
      case 'verified':
        return {
          icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
          title: 'Verified Counsellor',
          message: statusText['verified'],
          bgClass: 'bg-emerald-50/50 border-emerald-100',
          accentColor: 'text-emerald-600',
          badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-8 h-8 text-red-600" />,
          title: 'Verification Incomplete',
          message: statusText['rejected'],
          bgClass: 'bg-red-50/50 border-red-100',
          accentColor: 'text-red-600',
          badgeClass: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'verification_in_progress':
        return {
          icon: <Clock className="w-8 h-8 text-slate-600" />,
          title: 'Verification Ongoing',
          message: statusText['verification_in_progress'],
          bgClass: 'bg-slate-50/50 border-slate-100',
          accentColor: 'text-slate-600',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
        };
      case 'test_pending':
        return {
          icon: <Star className="w-8 h-8 text-red-600 animate-pulse" />,
          title: 'Assessment Available!',
          message: statusText['test_pending'],
          bgClass: 'bg-gradient-to-br from-red-50/80 via-white to-red-50/30 border-red-100',
          accentColor: 'text-red-600',
          badgeClass: 'bg-red-100 text-red-700 border-red-200'
        };
      default:
        return {
          icon: <Shield className="w-8 h-8 text-red-600" />,
          title: 'Certification Opportunity',
          message: statusText['not_applied'],
          bgClass: 'bg-gradient-to-br from-red-50/50 via-white to-red-50/20 border-red-100',
          accentColor: 'text-red-600',
          badgeClass: 'bg-red-100 text-red-700 border-red-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn(
      "relative overflow-hidden border px-6 py-8 rounded-[2rem] shadow-xl shadow-red-500/5 mb-8 flex flex-col lg:flex-row items-center justify-between gap-8 transition-all hover:shadow-2xl hover:shadow-red-500/10 group",
      config.bgClass
    )}>
      {/* Decorative radial glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/5 rounded-full blur-3xl -ml-24 -mb-24" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1 text-center md:text-left z-10">
        <div className="relative shrink-0">
          <div className="p-5 bg-white rounded-2xl shadow-lg border border-red-50 flex items-center justify-center relative z-10">
            {config.icon}
          </div>
          {/* Icon glow backplate */}
          <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full scale-150 animate-pulse" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{config.title}</h3>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm",
              config.badgeClass
            )}>
              {propStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-600 text-md max-w-2xl leading-relaxed font-medium">
            {showPayButtons ? statusText['not_applied'] : (
              status === 'test_scheduled' && displayDate
                ? `Your assessment is scheduled for ${new Date(displayDate).toLocaleDateString()} at ${displaySlot || 'the chosen time'}.`
                : config.message
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 shrink-0 z-10">
        {showPayButtons && (
          <>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200 border-none transition-all hover:translate-y-[-4px] active:translate-y-0 h-14 px-8 rounded-2xl font-black text-lg group/btn"
              onClick={onPay}
            >
              Pay & Give Test Now
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600 transition-all font-black h-14 px-8 rounded-2xl border-2"
              onClick={onSchedule}
            >
              Pay & Schedule
            </Button>
          </>
        )}

        {status === 'test_pending' && (
          <Button
            className="bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200 border-none transition-all hover:translate-y-[-4px] font-black h-14 px-10 rounded-2xl text-lg group/btn"
            onClick={() => router.push('/dashboard/counselor-test')}
          >
            Start Assessment Now
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        )}

        {finalStatus === 'verified' && (
          <div className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
            Verified Profile
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
