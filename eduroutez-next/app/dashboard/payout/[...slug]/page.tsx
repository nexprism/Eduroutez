import PayoutViewPage from '../_components/payout-view-page';

export const metadata = {
  title: 'Dashboard : Payout'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <PayoutViewPage />;
}
