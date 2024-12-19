import PayoutForm from './payout-form';
import PageContainer from '@/components/layout/page-container';

export default function PayoutViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <PayoutForm />
      </div>
    </PageContainer>
  );
}
