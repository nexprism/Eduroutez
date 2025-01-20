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
  const [visibleCount, setVisibleCount] = useState(3);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/all-refferal`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = response.data.data.map((item: any) => ({
          id: item._id,
          referrer: item.refer_by.name,
          referrerEmail: item.refer_by.email,
          referred: item.name,
          referredEmail: item.email,
          date: new Date(item.createdAt).toLocaleDateString(),
          rewardPaid: item.points.toString(),
        }));
        setReferrals(data);
        setTotalReferrals(response.data.totalCount); // Assuming the API returns totalCount
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }
    };

    fetchReferrals();
  }, []);

  // Filter referrals based on search term
  const filteredReferrals = referrals.filter(referral => {
    return (
      referral.referrer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referred.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referrerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort referrals
  const sortedReferrals = [...filteredReferrals].sort((a, b) => {
    const aValue = a[sortField as keyof Referral];
    const bValue = b[sortField as keyof Referral];

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: keyof Referral) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSeeMore = () => {
    setVisibleCount(prevCount => prevCount + 10);
  };

  const handleSeeLess = () => {
    setVisibleCount(3);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedReferrals.slice(0, visibleCount).map(referral => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{referral.referrer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.referrerEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{referral.referred}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.referredEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{referral.rewardPaid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Buttons */}
      <div className="flex justify-center space-x-4 mt-4">
        {visibleCount < sortedReferrals.length && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleSeeMore}
          >
            See More
          </button>
        )}
        {visibleCount > 10 && (
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onClick={handleSeeLess}
          >
            See Less
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminReferralsPage;
