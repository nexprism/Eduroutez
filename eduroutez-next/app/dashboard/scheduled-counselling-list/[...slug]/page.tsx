import QuestionAnswerViewPage from '../_components/online-counselling-view-page';

export const metadata = {
  title: 'Dashboard : Questions and Answers'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <QuestionAnswerViewPage />;
}
