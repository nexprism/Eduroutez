'use client';
import React, { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';

interface Issue {
    _id: string;
    title: string;
    image: string;
    description: string;
    institute: {
        name: string;
        contact_number: string;
        role: string;
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

interface Inquiry {
    instituteName: string;
    email: string;
    institutePhone: string;
    // Add other fields as needed
}

interface IssueDetail {
    _id: string;
    title: string;
    image: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    institute: {
        name: any;
        contact_number: any;
        role: any;
        instituteName: string;
        email: string;
        institutePhone: string;
    };
    // Add other fields that might be in the issue detail response
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const ImageUrl = process.env.NEXT_PUBLIC_NEW_IMAGES;

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'open':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
        case 'closed':
            return 'bg-muted text-foreground/70';
        default:
            return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
    }
};

const HelpSupportPage: React.FC = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [inquiryData, setInquiryData] = useState<Inquiry | null>(null);
    const [issueDetail, setIssueDetail] = useState<IssueDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

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
            console.log('Institute:', institute);
            return {
                name: institute.name || 'N/A',
                email: institute.email || 'N/A',
                phone: institute.contact_number || 'N/A',
                role: institute.role || 'N/A'   
            };
        }
        return {
            name: 'N/A',
            email: 'N/A',
            phone: 'N/A',
            role: 'N/A'
        };
    };

    const handleOpenModal = async (issueId: string) => {
        setSelectedIssueId(issueId);
        setDetailLoading(true);
        
        try {
            // Fetch institute inquiry data
            const inquiryResponse = await axiosInstance.get(`${apiUrl}/issue/${issueId}`);
            setInquiryData(inquiryResponse.data);
            
            // Fetch issue detail data
            const issueDetailResponse = await axiosInstance.get(`${apiUrl}/issue/${issueId}`);
            setIssueDetail(issueDetailResponse.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedIssueId(null);
        setInquiryData(null);
        setIssueDetail(null);
    };

    const displayedIssues = issues.slice(0, displayCount);
    const hasMoreIssues = displayCount < issues.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-background p-4 md:p-8">
            <div className="p-4 bg-card shadow border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">Help & Support Dashboard</h1>
            </div>

            <div className="flex-1 overflow-x-scroll p-4">
                {issues.length > 0 ? (
                    <div className="bg-card rounded shadow border border-border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dates</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {displayedIssues.map((issue) => {
                                        const instituteDetails = getInstituteDetails(issue.institute);
                                        return (
                                            <tr key={issue._id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{issue.title}</div>
                                                    <div className="text-sm text-muted-foreground max-w-[400px] truncate">{issue.description}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                                        {issue.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                        {issue.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">
                                                    <div>{instituteDetails.name}</div>
                                                    <div className="text-muted-foreground">{instituteDetails.email}</div>
                                                    <div className="text-muted-foreground">{instituteDetails.phone}</div>
                                                    <div className='text-muted-foreground'>{instituteDetails.role}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div>Created: {new Date(issue.createdAt).toLocaleDateString()}</div>
                                                    <div>Updated: {new Date(issue.updatedAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end space-x-2">
                                                        <button 
                                                            onClick={() => handleStatusUpdate(issue._id, issue.status === 'open' ? 'closed' : 'open')}
                                                            className={`relative overflow-hidden px-4 py-2 rounded-md text-xs font-medium group ${
                                                                issue.status === 'open' 
                                                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
                                                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                                            }`}
                                                        >
                                                            <span className="relative z-10">{issue.status === 'open' ? 'Close' : 'Reopen'}</span>
                                                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                                            <span className="absolute bottom-0 left-0 w-full h-0 bg-black bg-opacity-10 group-hover:h-full transition-all duration-300"></span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenModal(issue._id)}
                                                            className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-md text-xs font-medium group"
                                                        >
                                                            <span className="relative z-10">View Details</span>
                                                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                                            <span className="absolute -right-12 bottom-0 w-12 h-32 bg-white bg-opacity-20 transform rotate-12 group-hover:translate-x-8 transition-transform duration-500"></span>
                                                            <span className="absolute -left-12 bottom-0 w-12 h-32 bg-white bg-opacity-20 transform -rotate-12 group-hover:-translate-x-8 transition-transform duration-500"></span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {hasMoreIssues && (
                            <div className="py-3 px-6 bg-muted/50 border-t border-border">
                                <button 
                                    onClick={handleSeeMore}
                                    className="w-full relative overflow-hidden px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-md text-sm font-medium group flex items-center justify-center"
                                >
                                    <span className="relative z-10">Load More Issues</span>
                                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                    <span className="absolute bottom-0 left-0 h-1 w-0 bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-card rounded shadow border border-border p-6 text-center">
                        <p className="text-muted-foreground">No issues found.</p>
                    </div>
                )}
            </div>

            {selectedIssueId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                    <div className="bg-card rounded-lg shadow-xl border border-border p-6 w-full max-w-md transform transition-all duration-300">
                        {detailLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-foreground">Issue Details</h2>
                                    <button 
                                        onClick={handleCloseModal}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {issueDetail && (
                                    <div className="space-y-4 max-h-[700px] overflow-y-auto max-w-md">
                                        <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20">
                                            <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{issueDetail.title}</h3>
                                            <span className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issueDetail.status)}`}>
                                                {issueDetail.status}
                                            </span>
                                            <span className="ml-2 inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                                                {issueDetail.category}
                                            </span>
                                        </div>
                                        
                                        {issueDetail.image && (
                                            <div className="mt-3">
                                                <img 
                                                    src={`${ImageUrl}/${issueDetail.image}`} 
                                                    alt={issueDetail.title} 
                                                    className="w-full h-auto rounded-lg"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                            <h4 className="font-medium text-foreground mb-2">Description</h4>
                                            <p className="text-foreground/90 whitespace-pre-line">{issueDetail.description}</p>
                                        </div>
                                        
                                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                            <h4 className="font-medium text-foreground mb-2">Timeline</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Created</p>
                                                    <p className="font-medium text-foreground">{new Date(issueDetail.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Last Updated</p>
                                                    <p className="font-medium text-foreground">{new Date(issueDetail.updatedAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                            <h4 className="font-medium text-foreground mb-2">Information</h4>
                                            {issueDetail.institute && (
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Name</p>
                                                        <p className="font-medium text-foreground">{issueDetail.institute?.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Email</p>
                                                        <p className="font-medium text-foreground">{issueDetail.institute.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Phone</p>
                                                        <p className="font-medium text-foreground">{issueDetail.institute?.contact_number}</p>
                                                    </div>
                                                    <p className='text-muted-foreground'>Role</p>
                                                    <p className='font-medium text-foreground'>{issueDetail.institute?.role}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button 
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                                    >
                                        Close
                                    </button>
                              
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpSupportPage;