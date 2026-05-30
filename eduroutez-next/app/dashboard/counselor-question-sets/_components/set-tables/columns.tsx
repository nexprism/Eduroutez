'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function ActionsCell({ row }: { row: any }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const id = row.original._id;

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`${apiUrl}/question-set/${id}`);
            toast.success('Question set deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['counselor-question-sets'] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete question set');
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.push(`/dashboard/counselor-question-sets/${id}`)}
                title="Edit"
            >
                <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question Set</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>&quot;{row.original.setName}&quot;</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'setName',
        header: 'SET NAME'
    },
    {
        accessorKey: 'totalQuestions',
        header: 'TOTAL QUESTIONS'
    },
    {
        accessorKey: 'timeLimit',
        header: 'TIME LIMIT (MIN)'
    },
    {
        accessorKey: 'createdAt',
        header: 'CREATED AT',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    },
    {
        id: 'actions',
        header: 'ACTIONS',
        cell: ({ row }) => <ActionsCell row={row} />
    }
];
