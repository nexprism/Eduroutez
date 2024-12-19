import AdminViewPage from '../_components/admin-view-page';

export const metadata = {
  title: 'Dashboard : Admin'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <AdminViewPage />;
}
