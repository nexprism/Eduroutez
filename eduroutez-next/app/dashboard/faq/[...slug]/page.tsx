import FaqViewPage from '../_components/faq-view-page';

export const metadata = {
  title: 'Dashboard : FAQs'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <FaqViewPage />;
}
