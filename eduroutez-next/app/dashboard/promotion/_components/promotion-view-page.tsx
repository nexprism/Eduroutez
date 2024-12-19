import PromotionForm from './promotion-form';
import PageContainer from '@/components/layout/page-container';

export default function PromotionViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <PromotionForm />
      </div>
    </PageContainer>
  );
}
