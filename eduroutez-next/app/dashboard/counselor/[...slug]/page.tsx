import CounselorViewPage from '../_components/counselor-view-page';

export const metadata = {
  title: 'Dashboard : Counselor'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <CounselorViewPage />;
}
