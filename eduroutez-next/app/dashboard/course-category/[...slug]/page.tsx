import CourseCategoryViewPage from "../_components/course-category-view-page";

export const metadata = {
  title: 'Dashboard : Course Categories'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <CourseCategoryViewPage />;
}
