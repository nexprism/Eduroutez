import PromotionViewPage from '../_components/promotion-view-page';

export const metadata = {
  title: 'Dashboard : Promotion'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <PromotionViewPage />;
}
