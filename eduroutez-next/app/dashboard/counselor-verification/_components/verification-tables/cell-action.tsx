'use client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';


interface CellActionProps {
    data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const router = useRouter();

    const onVerify = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(`${apiUrl}/counselor-test/verify/${data._id}`);
            if (response.data.success) {
                toast.success('Counselor verified and certificate generated!');
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const onReject = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(`${apiUrl}/counselor-test/reject/${data._id}`, {
                reason: rejectionReason
            });
            if (response.data.success) {
                toast.success('Counselor verification rejected');
                setShowRejectDialog(false);
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Test Result Analysis: {data.firstname} {data.lastname}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted p-3 rounded-md">
                                <p className="text-xs text-muted-foreground uppercase font-bold">Total Score</p>
                                <p className="text-2xl font-bold">{data.testResult?.score} / {data.testResult?.totalQuestions}</p>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <p className="text-xs text-muted-foreground uppercase font-bold">Time Taken</p>
                                <p className="text-2xl font-bold">{Math.floor(data.testResult?.timeTaken / 60)}m {data.testResult?.timeTaken % 60}s</p>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <p className="text-xs text-muted-foreground uppercase font-bold">Status</p>
                                <p className="text-2xl font-bold uppercase">{data.testResult?.status}</p>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <p className="text-xs text-muted-foreground uppercase font-bold">Question Set</p>
                                <p className="text-2xl font-bold">{data.testResult?.questionSetId?.setName || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="border rounded-md p-4 bg-muted/50">
                            <h4 className="font-bold mb-2">Review Summary</h4>
                            <p className="text-sm">
                                The counselor attempted {data.testResult?.totalQuestions} questions and got {data.testResult?.score} correct.
                                Average time per question: {(data.testResult?.timeTaken / data.testResult?.totalQuestions).toFixed(2)} seconds.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResultDialog(false)}>Close</Button>
                        <Button onClick={onVerify} disabled={loading} className="bg-green-600 hover:bg-green-700">
                            Approve Verification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Verification</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting the verification of {data.firstname} {data.lastname}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Type the reason for rejection here..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={onReject}
                            disabled={loading || !rejectionReason.trim()}
                        >
                            Confirm Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setShowResultDialog(true)}>
                        <FileText className="mr-2 h-4 w-4" /> Review Test Result
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/counselor/${data._id}`)}>
                        <Eye className="mr-2 h-4 w-4" /> View Full Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onVerify} disabled={loading} className="text-green-600 font-bold">
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve & Verify
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowRejectDialog(true)} className="text-red-600">
                        <XCircle className="mr-2 h-4 w-4" /> Reject Verification
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
