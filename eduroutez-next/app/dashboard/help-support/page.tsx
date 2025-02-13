'use client';
import React, { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';

interface Issue {
    _id: string;
    title: string;
    image: string;
    description: string;
    institute: {
        instituteName: string;
        email: string;
        institutePhone: string;
        _id: string;
    } | string;
    category: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const ImageUrl = process.env.NEXT_PUBLIC_NEW_IMAGES;

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'open':
            return 'bg-green-100 text-green-800';
        case 'closed':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-blue-100 text-blue-800';
    }
};

const HelpSupportPage: React.FC = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await axiosInstance.get(`${apiUrl}/issues-list`);
                setIssues(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching issues:', error);
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);

    const handleSeeMore = () => {
        setDisplayCount(displayCount + 10);
    };

    const handleStatusUpdate = async (issueId: string, newStatus: string) => {
        try {
            const response = await axiosInstance.patch(`${apiUrl}/updateIssue/${issueId}`, { status: newStatus });
            if (response.status === 200) {
                setIssues((prevIssues) =>
                    prevIssues.map((issue) =>
                        issue._id === issueId ? { ...issue, status: newStatus } : issue
                    )
                );
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getInstituteDetails = (institute: Issue['institute']) => {
        if (typeof institute === 'object' && institute !== null) {
            return {
                name: institute.instituteName || 'N/A',
                email: institute.email || 'N/A',
                phone: institute.institutePhone || 'N/A'
            };
        }
        return {
            name: 'N/A',
            email: 'N/A',
            phone: 'N/A'
        };
    };

    const displayedIssues = issues.slice(0, displayCount);
    const hasMoreIssues = displayCount < issues.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <div className="p-6 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">Help & Support Dashboard</h1>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {issues.length > 0 ? (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {displayedIssues.map((issue) => {
                                            const instituteDetails = getInstituteDetails(issue.institute);
                                            return (
                                                <tr key={issue._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-2">
                                                            <div className="font-medium text-gray-900">{issue.title}</div>
                                                            <div className="text-sm text-gray-500 line-clamp-2">{issue.description}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                                                            {issue.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                                                            {issue.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm">
                                                            <div>{instituteDetails.name}</div>
                                                            <div className="text-gray-500">{instituteDetails.email}</div>
                                                            <div className="text-gray-500">{instituteDetails.phone}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div>Created: {new Date(issue.createdAt).toLocaleDateString()}</div>
                                                        <div>Updated: {new Date(issue.updatedAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => handleStatusUpdate(issue._id, issue.status === 'open' ? 'closed' : 'open')}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                                                        >
                                                            {issue.status === 'open' ? 'Close Issue' : 'Reopen Issue'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {hasMoreIssues && (
                                <div className="py-4 px-6 bg-gray-50 border-t border-gray-200">
                                    <button 
                                        onClick={handleSeeMore}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-500 text-lg">No issues found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpSupportPage;