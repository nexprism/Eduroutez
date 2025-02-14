'use client'
import React, { useState, useEffect } from 'react';
import { Search, Download, ArrowUpDown, Users } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface Referral {
  id: string;
  referrer: string;
  referrerEmail: string;
  referred: string;
  referredEmail: string;
  date: string;
  rewardPaid: string;
}

const AdminReferralsPage = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Safe string conversion utility that handles null/undefined
  const safeString = (value: any): string => {
    if (value === null || value === undefined || typeof value === 'undefined') return '';
    return String(value);
  };

  // Safe toLowerCase utility that handles null/undefined
  const safeLowerCase = (value: any): string => {
    const str = safeString(value);
    return str ? str.toLowerCase() : '';
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/all-refferal`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response?.data?.data) {
          setReferrals([]);
          return;
        }

        const data = response.data.data.map((item: any) => ({
          id: safeString(item?._id),
          referrer: safeString(item?.refer_by?.name),
          referrerEmail: safeString(item?.refer_by?.email),
          referred: safeString(item?.name),
          referredEmail: safeString(item?.email),
          date: item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
          rewardPaid: safeString(item?.points),
        }));
        setReferrals(data);
        setTotalReferrals(response.data.totalCount || 0);
      } catch (error) {
        console.error('Error fetching referrals:', error);
        setReferrals([]);
        setTotalReferrals(0);
      }
    };

    fetchReferrals();
  }, []);

  // Filter referrals based on search term with null checks
  const filteredReferrals = referrals.filter(referral => {
    if (!searchTerm) return true;
    
    const search = safeLowerCase(searchTerm);
    if (!search) return true;

    return (
      safeLowerCase(referral?.referrer).includes(search) ||
      safeLowerCase(referral?.referred).includes(search) ||
      safeLowerCase(referral?.referrerEmail).includes(search) ||
      safeLowerCase(referral?.referredEmail).includes(search)
    );
  });

  // Sort referrals with null checks
  const sortedReferrals = [...filteredReferrals].sort((a, b) => {
    if (!a || !b) return 0;
    
    const aValue = safeString(a[sortField as keyof Referral]);
    const bValue = safeString(b[sortField as keyof Referral]);

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil(sortedReferrals.length / itemsPerPage);

  // Get referrals for the current page
  const currentReferrals = sortedReferrals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: keyof Referral) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6  space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-600">Monitor and manage all platform referrals</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search referrals..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => handleSort('referrer')}
                >
                  <div className="flex items-center gap-2">
                    Referrer
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Referrer Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Referred User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Referred Email</th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentReferrals.map((referral, index) => (
                <tr key={referral.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{referral.referrer || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.referrerEmail || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{referral.referred || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.referredEmail || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.date || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end space-x-4 mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-lg transition-colors ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminReferralsPage;
