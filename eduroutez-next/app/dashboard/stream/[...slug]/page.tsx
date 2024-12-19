import StreamViewPage from '../_components/stream-view-page';

export const metadata = {
  title: 'Dashboard : Stream'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <StreamViewPage />;
}
