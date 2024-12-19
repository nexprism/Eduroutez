import CourseViewPage from '../_components/course-view-page';

export const metadata = {
  title: 'Dashboard : Course'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <CourseViewPage />;
}
