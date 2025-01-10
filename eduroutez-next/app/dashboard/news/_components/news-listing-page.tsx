'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import axiosInstance from '@/lib/axios';

const NewsListingPage: React.FC = () => {
    interface News {
        _id: number;
        id: number;
        image: string;
        title: string;
        description: string;
        date: string;
    }
    
    const [newsData, setNewsData] = useState<News[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 3;

    // Fetch institute from local storage
    const institute = typeof window !== 'undefined' ? localStorage.getItem('instituteId') : null;
    console.log('Institute:', institute);

    // Fetch news data from API
    useEffect(() => {
        const fetchNewsData = async () => {
            if (!institute) {
                console.error('Institute not found in local storage');
                return;
            }
            
            try {
                setIsLoading(true);
                const response = await axiosInstance.get(
                    `http://localhost:4001/api/v1/news/${institute}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response) {
                    throw new Error('Failed to fetch news data');
                }
                console.log('News data:', response.data.data);
                setNewsData(response.data.data);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewsData();
    }, [institute]);

    if (!newsData) {
        return <p className="text-center">No news articles found</p>;
    }

    const totalItems = newsData.length;
    
    const handleNextPage = () => {
        if (page * itemsPerPage < totalItems) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };
console.log('newsDatabn:', newsData);

    const paginatedNewsData = newsData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleDelete = async (id: number) => {
        try {
            const response = await axiosInstance.delete(`http://localhost:4001/api/v1/news/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
            }});
            if (!response) {
                throw new Error('Failed to delete news article');
            }
            setNewsData(newsData.filter((news) => news._id !== id));
        } catch (error) {
            console.error('Error deleting news article:', error);
        }
    };

    const handleUpdate = (id: number) => {
        alert(`Update functionality for article with ID: ${id}`);
    };

    return (
        <div>
            <div className="space-y-4 p-12">
                <div className="flex flex-col gap-2 lg:flex-row items-start justify-between">
                    <Heading
                        title={`News Articles (${totalItems})`}
                        description="All the latest news articles are listed here."
                    />
                    <div className="flex gap-4">
                        <Button asChild className="w-fit whitespace-nowrap px-2">
                            <Link href="/dashboard/news/new">
                                <Plus className="mr-1 h-4 w-4" /> Add News
                            </Link>
                        </Button>
                    </div>
                </div>
                <Separator />
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <p className="text-center">Loading...</p>
                    ) : (
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left">ID</th>
                                    <th className="px-4 py-2 text-left">Image</th>
                                    <th className="px-4 py-2 text-left">Title</th>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-left">Date</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
    {paginatedNewsData.map((news: News,index:any) => (
        console.log('news:', news.image),
        <tr key={news.id} className="border-b hover:bg-gray-100">
           <td className="px-4 py-2">{index + 1}</td>
               <td className="px-4 py-2">
                <img 
                    src={`http://localhost:4001/api/uploads/${news.image}`} 
                    alt={news.title} 
                    className="w-16 h-16 object-cover" 
                />
            </td>
            <td className="px-4 py-2">{news.title}</td>
            <td className="px-4 py-2">{news.description}</td>
            <td className="px-4 py-2">{news.date}</td>
            <td className="px-4 py-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => handleUpdate(news.id)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Pencil className="h-4 w-4" />
                            Update
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDelete(news._id)}
                            className="flex items-center gap-2 cursor-pointer text-red-600"
                        >
                            <Trash className="h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    ))}
</tbody>

                        </table>
                    )}
                </div>
                <div className="flex justify-between mt-4">
                    <Button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-500 text-white"
                    >
                        See Less
                    </Button>
                    <Button
                        onClick={handleNextPage}
                        disabled={page * itemsPerPage >= totalItems}
                        className="px-4 py-2 bg-gray-500 text-white"
                    >
                        See More
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NewsListingPage;
