import React, { useState, useEffect } from 'react';
import { Edit, MoreHorizontal } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const CellAction = ({ data }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState('');
    const [status, setStatus] = useState('');
    
    const queryClient = useQueryClient();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Query for fetching slot data
    const { data: slotData } = useQuery({
        queryKey: ['scheduled-slot', data._id],
        queryFn: async () => {
            const response = await axiosInstance.get(`${apiUrl}/scheduled-slots/${data._id}`);
            return response.data;
        },
        enabled: false // Query won't run automatically
    });

    const updateScheduledSlotMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance({
                url: `${apiUrl}/scheduled-slots/${data._id}`,
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { status, link }
            });
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scheduled-slots'] });
            window.location.reload();
        },
        onSettled: () => {
            setIsUpdateModalOpen(false);
            setLoading(false);
        }
    });

    const handleUpdate = () => {
        setLoading(true);
        updateScheduledSlotMutation.mutate();
    };

    const handleOpenUpdateModal = async () => {
        const response = await axiosInstance.get(`${apiUrl}/scheduled-slot/${data._id}`);
        if (response?.data) {
            setLink(response.data?.data?.link || '');
            setStatus(response?.data?.data?.status || '');
        }
        setIsUpdateModalOpen(true);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e:any) => {
            if (isDropdownOpen) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div className="relative inline-block text-left">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
                <MoreHorizontal className="h-4 w-4 text-gray-600" />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b">
                            Actions
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenUpdateModal();
                                setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Update
                        </button>
                    </div>
                </div>
            )}

            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div 
                        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Update Scheduled Slot</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link
                                </label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select status</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors duration-200"
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};