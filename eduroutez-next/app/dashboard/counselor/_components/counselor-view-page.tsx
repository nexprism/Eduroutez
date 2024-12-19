import CounselorForm from './counselor-form';
import PageContainer from '@/components/layout/page-container';

export default function CounselorViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <CounselorForm />
      </div>
    </PageContainer>
  );
}
