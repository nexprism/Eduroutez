import QuestionAnswerForm from './question-answer-form';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function QuestionAnswerViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <div className="mb-6">
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-[#FFF5F7] to-[#FFF9FB] p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-900">Get Verified to Enable Student Bookings</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-xl">Complete a short verification test — our team reviews your results and documents. Once approved, students can schedule sessions from your uploaded slots and you'll receive a "Verified Counselor" badge and priority listings.</p>
                <ul className="mt-3 text-sm text-slate-600 list-disc pl-5 space-y-1">
                  <li>Take the verification test</li>
                  <li>Eduroutez reviews results & documents</li>
                  <li>After approval, your slots become bookable</li>
                </ul>
              </div>

              <div className="flex gap-3 md:gap-4 md:items-center">
                <Link href="/dashboard/counselor-test">
                  <Button className="bg-[#FF2D55] hover:bg-[#e0204a] text-white rounded-2xl font-black h-12 px-6">Go to Dashboard & Take Test</Button>
                </Link>
               
              </div>
            </div>
          </div>
        </div>
        <QuestionAnswerForm />
      </div>
    </PageContainer>
  );
}
