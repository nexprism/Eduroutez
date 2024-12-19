import InstituteViewPage from '../../_components/institute-view-page';

export const metadata = {
  title: 'Dashboard : Institute'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <InstituteViewPage />;
}
