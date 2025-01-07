'use client'
import React, { useState } from 'react';
import { Search, Download, ArrowUpDown, Users } from 'lucide-react';

// Sample data - in real app would come from API
const referrals = [
  { 
    id: 1, 
    referrer: 'John Smith',
    referrerEmail: 'john@example.com',
    referred: 'Alice Cooper',
    referredEmail: 'alice@example.com',
    date: '2024-01-15',
    rewardPaid: '$25',
    signupDate: '2024-01-16',
    purchaseDate: '2024-01-20',
  },
  {
    id: 2,
    referrer: 'Sarah Johnson',
    referrerEmail: 'sarah@example.com',
    referred: 'Mike Wilson',
    referredEmail: 'mike@example.com',
    date: '2024-01-18',
    rewardPaid: '-',
    signupDate: '2024-01-19',
    purchaseDate: '-',
  },
  // Add more sample data as needed
];

const AdminReferralsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

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
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
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

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Rewards</p>
              <p className="text-2xl font-bold text-gray-900">$12,450</p>
            </div>
          </div>
        </div>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedReferrals.map(referral => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{referral.referrer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.referrerEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{referral.referred}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.referredEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{referral.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{referral.rewardPaid}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralsPage;
