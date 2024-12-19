import WebinarViewPage from '../_components/webinar-view-page';

export const metadata = {
  title: 'Dashboard : Webinar'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <WebinarViewPage />;
}
