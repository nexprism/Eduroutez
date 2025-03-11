"use client";
import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  TablePagination
} from "@/components/ui/table";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, TrendingUp, Users, CreditCard, Loader2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import axiosInstance from '@/lib/axios';

interface Income {
  _id: string;
  total: number;
}

interface EarningsData {
  totalSubscription: Income[];
  promotionIncome: Income[];
  unlistedpromotionIncome: Income[];
  counselorIcome: Income;
  counselorShares: Income;
  redeemInfo: {
    _id: string;
    count: number;
    totalPoints: number;
  };
}

interface Transaction {
  _id: string;
  amount: number;
  paymentId: string;
  remarks: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  subscription: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    email: string;
    name: string;
    is_verified: boolean;
  } | null;
}

interface TransactionResponse {
  data: any;
  result: Transaction[];
  currentPage: number;
  totalPages: number;
  totalDocuments: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: EarningsData;
  error: Record<string, unknown>;
}

const formatCurrency = (amount:any) => 
  `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatDate = (date:any) => 
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const StatusBadge = ({ status }) => {
  const styles = {
    COMPLETED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    FAILED: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${styles[status]}`}>
      {status}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};


export default function EarningsReportPage() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  const fetchTransactions = async (page: number) => {
    try {
      const response = await axiosInstance.get<TransactionResponse>(`${apiUrl}/transactions`, {
        params: {
          sort: JSON.stringify({ createdAt: 'desc' }),
          limit: 5,
          page
        }
      });
      setTransactionData(response.data?.data?.result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsRes, transactionsRes] = await Promise.all([
          axiosInstance.get<ApiResponse>(`${apiUrl}/earning-reports`,
            {
              headers: {
                'Content-Type': 'application/json'
            }
          }
          ),
          axiosInstance.get<TransactionResponse>(`${apiUrl}/transactions`, {
            headers: {
              'Content-Type': 'application/json'
          },
            params: {
              sort: JSON.stringify({ createdAt: 'desc' }),
              limit: 5,
              page: 1
            }
          })
        ]);

        if (!earningsRes.data.success) throw new Error(earningsRes.data.message);
        setEarningsData(earningsRes?.data?.data);
        console.log("hj",transactionsRes?.data?.data?.result)
        setTransactionData(transactionsRes?.data?.data?.result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );

  if (error) return <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>;
  if (!earningsData || !transactionData) return <Alert><AlertDescription>No data available</AlertDescription></Alert>;

  const chartData = [
    { name: 'Subscriptions', value: earningsData.totalSubscription[0]?.total ?? 0 },
    { name: 'Listed Ads', value: earningsData.promotionIncome[0]?.total ?? 0 },
    { name: 'Unlisted Ads', value: earningsData.unlistedpromotionIncome[0]?.total ?? 0 },
    { name: 'Counselor Income', value: earningsData.counselorIcome?.total ?? 0 },
    { name: 'Counselor Shares', value: earningsData.counselorShares?.total ?? 0 }
  ];

  const totalEarnings = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-6 space-y-6 h-dvh overflow-y-scroll">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Earnings Report</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(new Date().toISOString())}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalEarnings)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(earningsData.totalSubscription[0]?.total ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redeem Requests</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{earningsData.redeemInfo.count}</div>
            <p className="text-xs text-muted-foreground">
              {earningsData.redeemInfo.totalPoints} Points
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency((earningsData.promotionIncome[0]?.total ?? 0) + 
                (earningsData.unlistedpromotionIncome[0]?.total ?? 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Distribution of income sources</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  background={{ fill: '#eee' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest {transactionData?.result?.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionData?.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                    <TableCell>
                      {transaction.user ? (
                        <div>
                          <div className="font-medium">{transaction.user.name}</div>
                          <div className="text-xs text-muted-foreground">{transaction.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">User Deleted</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}