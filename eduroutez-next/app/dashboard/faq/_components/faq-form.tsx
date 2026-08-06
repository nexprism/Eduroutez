'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

export default function FaqForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const router = useRouter();
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const isEdit = segments.length >= 5 && segments[3] === 'update';
  const faqId = isEdit ? segments[4] : null;

  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');

  const { data: faqData } = useQuery({
    queryKey: ['faq-detail', faqId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/faq/${faqId}`);
      return response.data.data;
    },
    enabled: !!faqId,
  });

  React.useEffect(() => {
    if (faqData) {
      setQuestion(faqData.question || '');
      setAnswer(faqData.answer || '');
    }
  }, [faqData]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { question, answer };
      const email = localStorage.getItem('email') || '';
      if (email) payload.email = email;
      const response = await axiosInstance({
        url: `${apiUrl}/faq`,
        method: 'post',
        data: payload,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('FAQ created successfully');
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      router.push('/dashboard/faq');
    },
    onError: () => toast.error('Something went wrong'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (question) payload.question = question;
      if (answer) payload.answer = answer;
      const response = await axiosInstance({
        url: `${apiUrl}/faq/${faqId}`,
        method: 'patch',
        data: payload,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('FAQ updated successfully');
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      router.push('/dashboard/faq');
    },
    onError: () => toast.error('Something went wrong'),
  });

  const handleSubmit = () => {
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEdit ? 'Edit FAQ' : 'Add New FAQ'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Question</label>
            <Input
              placeholder="Write the question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Answer</label>
            <Textarea
              placeholder="Write the answer"
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Update FAQ' : 'Submit FAQ'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/faq')}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
