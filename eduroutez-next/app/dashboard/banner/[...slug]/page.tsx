import MediaViewPage from '../_components/media-view-page';

export const metadata = {
  title: 'Dashboard : Media'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <MediaViewPage />;
}
