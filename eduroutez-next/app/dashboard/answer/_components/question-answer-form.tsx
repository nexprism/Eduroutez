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
  const questionId = isEdit ? segments[4] : null;

  const [questionText, setQuestionText] = React.useState('');
  const [answerText, setAnswerText] = React.useState('');
  const [answerId, setAnswerId] = React.useState<string | null>(null);
  const [grade, setGrade] = React.useState('');
  const [label, setLabel] = React.useState('');

  const { data: qaData } = useQuery({
    queryKey: ['answer-detail', questionId],
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
      const currentEmail = localStorage.getItem('email') || '';
      const userAnswer = qaData.answers?.find(
        (a: any) => a.answeredBy === currentEmail || (typeof a.answeredBy === 'object' && a.answeredBy?.email === currentEmail)
      );
      if (userAnswer) {
        setAnswerText(userAnswer.answer || '');
        setAnswerId(userAnswer._id);
      }
    }
  }, [qaData]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const currentEmail = localStorage.getItem('email') || '';
      if (answerId) {
        const response = await axiosInstance({
          url: `${apiUrl}/question-answer/${questionId}/answer/${answerId}`,
          method: 'patch',
          data: { answer: answerText, answeredBy: currentEmail },
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      } else {
        const response = await axiosInstance({
          url: `${apiUrl}/question-answer/${questionId}/answer`,
          method: 'post',
          data: { answer: answerText, answeredBy: currentEmail },
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(answerId ? 'Answer updated successfully' : 'Answer submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['answer-detail', questionId] });
      router.push('/dashboard/answer');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Something went wrong');
    },
  });

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {answerId ? 'Edit Your Answer' : 'Answer the Question'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {qaData ? (
            <>
              <div>
                <h3 className="font-semibold mb-1">Question</h3>
                <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: qaData.question }} />
                <div className="flex gap-2 mt-2">
                  {qaData.grade && <Badge variant="outline">{qaData.grade}</Badge>}
                  {qaData.label && <Badge>{qaData.label}</Badge>}
                </div>
              </div>

              {qaData.answers && qaData.answers.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Existing Answers ({qaData.answers.length})</h3>
                    <div className="space-y-3">
                      {qaData.answers.map((ans: any) => (
                        <div key={ans._id} className="p-3 bg-gray-50 rounded-lg border">
                          <div dangerouslySetInnerHTML={{ __html: ans.answer }} className="text-sm mb-2" />
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>By: {ans.answeredBy?.name || ans.answeredBy?.email || ans.answeredBy || "Unknown"}</span>
                            <span>•</span>
                            <span>{new Date(ans.answeredAt).toLocaleDateString()}</span>
                          </div>
                          {ans.replies && ans.replies.length > 0 && (
                            <div className="ml-4 mt-2 space-y-1.5">
                              {ans.replies.map((rep: any) => (
                                <div key={rep._id} className="p-2 bg-white rounded border-l-2 border-gray-300">
                                  <div dangerouslySetInnerHTML={{ __html: rep.answer }} className="text-xs mb-1" />
                                  <div className="text-xs text-gray-400">
                                    {rep.repliedBy?.name || rep.repliedBy?.email || rep.repliedBy || "Unknown"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />
              <div>
                <label className="text-sm font-medium mb-1 block">Your Answer</label>
                <CustomEditor
                  value={answerText}
                  onChange={(val: string) => setAnswerText(val)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending || !answerText}
                >
                  {answerId ? 'Update Answer' : 'Submit Answer'}
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/answer')}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <p>Loading question...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
