'use client';
import QuestionSetForm from '../_components/set-form';

export default function EditQuestionSetPage({ params }: { params: { id: string } }) {
    return <QuestionSetForm questionSetId={params.id} />;
}
