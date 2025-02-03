import ReviewViewPage from '../_components/review-view-page';

export const metadata = {
  title: 'Dashboard : Review'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <ReviewViewPage />;
}
