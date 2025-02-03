import ReviewForm from './review-form';
import PageContainer from '@/components/layout/page-container';

export default function ReviewViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <ReviewForm />
      </div>
    </PageContainer>
  );
}
