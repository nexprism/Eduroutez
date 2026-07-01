'use client';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PageContainer from '@/components/layout/page-container';

const questionSchema = z.object({
    questionText: z.string().min(1, 'Question text is required'),
    options: z.array(z.object({
        optionText: z.string().min(1, 'Option text is required'),
        isCorrect: z.boolean().default(false)
    })).min(2, 'At least 2 options are required'),
    explanation: z.string().optional()
});

const formSchema = z.object({
    setName: z.string().min(1, 'Set name is required'),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
    totalQuestions: z.number().default(50),
    timeLimit: z.number().default(25),
    stream: z.string().optional()
});

type QuestionSetFormProps = {
    questionSetId?: string;
};

export default function QuestionSetForm({ questionSetId }: QuestionSetFormProps) {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isEditMode = !!questionSetId;
    const [isFetching, setIsFetching] = useState(isEditMode);
    const [streams, setStreams] = useState<any[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            setName: '',
            questions: [
                {
                    questionText: '',
                    options: [
                        { optionText: '', isCorrect: true },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false }
                    ],
                    explanation: ''
                }
            ],
            totalQuestions: 50,
            timeLimit: 25,
            stream: ''
        }
    });

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control: form.control,
        name: 'questions'
    });

    // Fetch counsellor streams
    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const res = await axiosInstance.get(`${apiUrl}/streams`, {
                    params: {
                        page: 0,
                        limit: 200,
                        filters: JSON.stringify({ isCounsellorStream: true })
                    }
                });
                setStreams(res.data?.data?.result || []);
            } catch (error) {
                console.error('Failed to fetch streams', error);
            }
        };
        fetchStreams();
    }, [apiUrl]);

    // Fetch existing data in edit mode
    useEffect(() => {
        if (!isEditMode) return;
        const fetchData = async () => {
            try {
                const res = await axiosInstance.get(`${apiUrl}/question-set/${questionSetId}`);
                const data = res.data?.data;
                if (data) {
                    form.reset({
                        setName: data.setName || '',
                        totalQuestions: data.totalQuestions || 50,
                        timeLimit: data.timeLimit || 25,
                        stream: data.stream || '',
                        questions: data.questions?.map((q: any) => ({
                            questionText: q.questionText || '',
                            explanation: q.explanation || '',
                            options: q.options?.map((opt: any) => ({
                                optionText: opt.optionText || '',
                                isCorrect: opt.isCorrect || false
                            })) || []
                        })) || []
                    });
                }
            } catch (error: any) {
                toast.error('Failed to fetch question set data');
                router.push('/dashboard/counselor-question-sets');
            } finally {
                setIsFetching(false);
            }
        };
        fetchData();
    }, [questionSetId, isEditMode]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEditMode) {
                const response = await axiosInstance.patch(`${apiUrl}/question-set/${questionSetId}`, values);
                if (response.data.success) {
                    toast.success('Question set updated successfully!');
                    router.push('/dashboard/counselor-question-sets');
                }
            } else {
                const response = await axiosInstance.post(`${apiUrl}/question-set`, values);
                if (response.data.success) {
                    toast.success('Question set created successfully!');
                    router.push('/dashboard/counselor-question-sets');
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} question set`);
        }
    }

    if (isFetching) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading question set...</span>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer scrollable>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Heading
                        title={isEditMode ? 'Edit Question Set' : 'Create Question Set'}
                        description={isEditMode ? 'Modify the existing question set.' : 'Add a new 50-question set for counselor certification.'}
                    />
                </div>
                <Separator />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="setName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Set Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Set A - General Psychology" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalQuestions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Questions</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="timeLimit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time Limit (Minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stream"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stream / Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="All Streams (General)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="">All Streams (General)</SelectItem>
                                                    {streams.map((s: any) => (
                                                        <SelectItem key={s._id} value={s.name}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Questions ({questionFields.length})</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendQuestion({
                                        questionText: '',
                                        options: [
                                            { optionText: '', isCorrect: true },
                                            { optionText: '', isCorrect: false },
                                            { optionText: '', isCorrect: false },
                                            { optionText: '', isCorrect: false }
                                        ],
                                        explanation: ''
                                    })}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Question
                                </Button>
                            </div>

                            {questionFields.map((field, index) => (
                                <Card key={field.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Question {index + 1}</CardTitle>
                                        <Button variant="ghost" size="sm" type="button" onClick={() => removeQuestion(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name={`questions.${index}.questionText`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question Text</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {field.options.map((_, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`questions.${index}.options.${optIndex}.isCorrect`}
                                                        render={({ field }) => (
                                                            <input
                                                                type="radio"
                                                                checked={field.value}
                                                                onChange={() => {
                                                                    const options = form.getValues(`questions.${index}.options`);
                                                                    options.forEach((_, i) => form.setValue(`questions.${index}.options.${i}.isCorrect`, i === optIndex));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`questions.${index}.options.${optIndex}.optionText`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormControl>
                                                                    <Input placeholder={`Option ${optIndex + 1}`} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name={`questions.${index}.explanation`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Explanation (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Update Question Set' : 'Create Question Set'}
                        </Button>
                    </form>
                </Form>
            </div>
        </PageContainer>
    );
}
