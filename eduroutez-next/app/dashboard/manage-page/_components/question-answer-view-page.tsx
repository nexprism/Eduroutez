import QuestionAnswerForm from './question-answer-form';
import PageContainer from '@/components/layout/page-container';

export default function QuestionAnswerViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <QuestionAnswerForm />
      </div>
    </PageContainer>
  );
}
