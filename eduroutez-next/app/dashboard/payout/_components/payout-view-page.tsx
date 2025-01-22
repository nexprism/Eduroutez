import PayoutForm from './payout-form';
import PageContainer from '@/components/layout/page-container';
import PayoutUpdateForm from '../_components/payout-tables/payout-update-form';

export default function PayoutViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <PayoutUpdateForm />
      </div>
    </PageContainer>
  );
}
