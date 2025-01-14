import SubscriptionViewPage from '../_components/subscription-view-page';

export const metadata = {
  title: 'Dashboard : Subscription'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <SubscriptionViewPage />;
}
