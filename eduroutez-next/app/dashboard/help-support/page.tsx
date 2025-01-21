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

const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    return `${ImageUrl}/${imagePath}`;
};

const HelpSupportPage: React.FC = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(6);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await axiosInstance.get(`${apiUrl}/issues-list`);
                console.log('Issues:', response.data.data);
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
        setDisplayCount(displayCount + 6);
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

    const displayedIssues = issues.slice(0, displayCount);
    const hasMoreIssues = displayCount < issues.length;

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

            <div className="flex-1 overflow-hidden p-6">
                <div className="max-w-7xl mx-auto h-full">
                    {issues.length > 0 ? (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {displayedIssues.map((issue) => {
                                        const instituteDetails = getInstituteDetails(issue.institute);
                                        return (
                                            <div 
                                                key={issue._id}
                                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                            >
                                                {issue.image && (
                                                    <div className="h-48 overflow-hidden">
                                                        <img 
                                                            src={getImageUrl(issue.image)}
                                                            alt={issue.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{issue.title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                                                            {issue.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-gray-600 mb-4 line-clamp-3">{issue.description}</p>
                                                    
                                                    <div className="space-y-2 text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <span className="font-medium">Category:</span>
                                                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                                {issue.category}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center">
                                                                <span className="font-medium">Institute:</span>
                                                                <span className="ml-2">{instituteDetails.name}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="font-medium">Email:</span>
                                                                <span className="ml-2">{instituteDetails.email}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="font-medium">Phone:</span>
                                                                <span className="ml-2">{instituteDetails.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                                                        <div className="flex justify-between">
                                                            <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                                                            <span>Updated: {new Date(issue.updatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <button 
                                                            onClick={() => handleStatusUpdate(issue._id, issue.status === 'open' ? 'closed' : 'open')}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                                        >
                                                            {issue.status === 'open' ? 'Close Issue' : 'Reopen Issue'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {hasMoreIssues && (
                                <div className="mt-6 flex justify-center">
                                    <button 
                                        onClick={handleSeeMore}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                    >
                                        See More
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