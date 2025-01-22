'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

const PayoutUpdateForm = () => {
    const [status, setStatus] = useState('PAID');
    const [paymentStatus, setPaymentStatus] = useState('Completed');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const payoutId = '6784e6f8f34b91e48ca15459';

    useEffect(() => {
        const fetchPayoutDetails = async () => {
            try {
                const response = await axiosInstance.get(`${apiUrl}/payout/${payoutId}`);
                const { status, paymentStatus, transactionId } = response.data;
                setStatus(status);
                setPaymentStatus(paymentStatus);
                setTransactionId(transactionId);
            } catch (error: any) {
                console.error('There was an error fetching payout details!', error);
                toast.error('Failed to fetch payout details. Please try again.');
            }
        };

        fetchPayoutDetails();
    }, [apiUrl, payoutId]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance(`${apiUrl}/payout/${payoutId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { status, paymentStatus, transactionId },
            });

            if (!response) {
                throw new Error('Network response was not ok');
            }
            toast.success('Payout status updated successfully!');
            setSuccess('Payout status updated successfully!');
        } catch (error: any) {
            console.error('There was an error!', error);
            toast.error(error.response.data.error || 'Failed to update payout status. Please try again.');
            setError(error.response.data.error || 'Failed to update payout status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className=" mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center pb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Update Payout Status
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Status Selection */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="PAID">PAID</option>
                                <option value="REJECTED">REJECTED</option>
                                <option value="UNPAID">UNPAID</option>
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Payment Status
                            </label>
                            <input
                                type="text"
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Transaction ID */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Transaction ID
                            </label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Error and Success Messages */}
                        {error && (
                            <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                                <p className="text-sm">{success}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                'Update Payout Status'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PayoutUpdateForm;
