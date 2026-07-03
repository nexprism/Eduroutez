'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import CustomEditor from '@/components/custom-editor';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function QuestionAnswerForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const router = useRouter();
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const isEdit = segments.length >= 5 && segments[3] === 'update';
  const isAnswerEdit = segments.length >= 5 && segments[3] === 'answers';
  const questionId = isEdit || isAnswerEdit ? segments[4] : null;

  const [questionText, setQuestionText] = React.useState('');
  const [answerTexts, setAnswerTexts] = React.useState<Record<string, string>>({});
  const [grade, setGrade] = React.useState('');
  const [label, setLabel] = React.useState('');

  const { data: qaData } = useQuery({
    queryKey: ['question-answer-detail', questionId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/question-answer-detail/${questionId}`);
      return response.data.data;
    },
    enabled: !!questionId,
  });

  React.useEffect(() => {
    if (qaData) {
      setQuestionText(qaData.question || '');
      setGrade(qaData.grade || '');
      setLabel(qaData.label || '');
      const texts: Record<string, string> = {};
      if (Array.isArray(qaData.answers)) {
        qaData.answers.forEach((ans: any) => {
          texts[ans._id] = ans.answer || '';
        });
      }
      setAnswerTexts(texts);
    }
  }, [qaData]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { question: questionText, grade, label };
      const email = localStorage.getItem('email') || '';
      payload.askedBy = email;
      const response = await axiosInstance({
        url: `${apiUrl}/question-answer`,
        method: 'post',
        data: payload,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Question created successfully');
      queryClient.invalidateQueries({ queryKey: ['question-answers'] });
      router.push('/dashboard/question-answer');
    },
    onError: () => toast.error('Something went wrong'),
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (questionText) payload.question = questionText;
      if (grade) payload.grade = grade;
      if (label) payload.label = label;
      const response = await axiosInstance({
        url: `${apiUrl}/question-answer/${questionId}`,
        method: 'patch',
        data: payload,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Question updated successfully');
      queryClient.invalidateQueries({ queryKey: ['question-answers'] });
      router.push('/dashboard/question-answer');
    },
    onError: () => toast.error('Something went wrong'),
  });

  const updateAnswerMutation = useMutation({
    mutationFn: async ({ answerId, answer }: { answerId: string; answer: string }) => {
      const response = await axiosInstance({
        url: `${apiUrl}/question-answer/${questionId}/answer/${answerId}`,
        method: 'patch',
        data: { answer, answeredBy: qaData?.answers?.find((a: any) => a._id === answerId)?.answeredBy || '' },
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Answer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['question-answer-detail', questionId] });
    },
    onError: () => toast.error('Failed to update answer'),
  });

  const handleSubmit = () => {
    if (isEdit) {
      updateQuestionMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  if (isAnswerEdit) {
    return (
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">Manage Answers</CardTitle>
          {qaData && <CardDescription>Question: {qaData.question}</CardDescription>}
        </CardHeader>
        <CardContent>
          {qaData ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Question</h3>
                <p className="text-muted-foreground">{qaData.question}</p>
                <div className="flex gap-2 mt-2">
                  {qaData.grade && <Badge variant="outline">{qaData.grade}</Badge>}
                  {qaData.label && <Badge>{qaData.label}</Badge>}
                </div>
              </div>
              <Separator />
              <h3 className="font-semibold">
                Answers ({qaData.answers?.length || 0})
              </h3>
              {(!qaData.answers || qaData.answers.length === 0) && (
                <p className="text-muted-foreground">No answers yet.</p>
              )}
              {qaData.answers?.map((answer: any) => (
                <Card key={answer._id} className="border p-4">
                  <div className="mb-2 text-sm text-muted-foreground">
                    Answered by:{' '}
                    {typeof answer.answeredBy === 'object'
                      ? answer.answeredBy?.name || answer.answeredBy?.email
                      : answer.answeredBy}
                    {answer.isEdited && ' (edited)'}
                  </div>
                  <CustomEditor
                    value={answerTexts[answer._id] ?? answer.answer ?? ''}
                    onChange={(val: string) =>
                      setAnswerTexts((prev) => ({ ...prev, [answer._id]: val }))
                    }
                  />
                  <div className="flex justify-end mt-3">
                    <Button
                      size="sm"
                      onClick={() =>
                        updateAnswerMutation.mutate({
                          answerId: answer._id,
                          answer: answerTexts[answer._id] || '',
                        })
                      }
                      disabled={updateAnswerMutation.isPending}
                    >
                      Update Answer
                    </Button>
                  </div>
                </Card>
              ))}
              <div className="flex justify-start">
                <Button variant="outline" onClick={() => router.push('/dashboard/question-answer')}>
                  Back to List
                </Button>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEdit ? 'Edit Question' : 'Add New Question'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Question</label>
            <Input
              placeholder="Write the question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Grade</label>
              <Input
                placeholder="e.g. 10th, 12th"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Label</label>
              <Input
                placeholder="e.g. Placement, Admission"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>
          {isEdit && qaData && qaData.answers?.length > 0 && (
            <div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground mb-2">
                This question has {qaData.answers.length} answer(s). Use
                &quot;View / Edit Answers&quot; from the list to manage them.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateQuestionMutation.isPending}>
              {isEdit ? 'Update Question' : 'Submit Question'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/question-answer')}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
