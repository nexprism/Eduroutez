import StudentViewPage from '../_components/student-view-page';

export const metadata = {
  title: 'Dashboard : Student'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <StudentViewPage />;
}
