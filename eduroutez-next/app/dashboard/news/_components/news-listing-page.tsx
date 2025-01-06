'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const staticNewsData = [
    {
        id: 1,
        title: 'News Article 1',
        description: 'This is the description for news article 1.',
        date: '2023-10-01',
        image: '/path/to/image1.jpg', // Replace with your actual image paths
    },
    {
        id: 2,
        title: 'News Article 2',
        description: 'This is the description for news article 2.',
        date: '2023-10-02',
        image: '/path/to/image2.jpg',
    },
    {
        id: 3,
        title: 'News Article 3',
        description: 'This is the description for news article 3.',
        date: '2023-10-03',
        image: '/path/to/image3.jpg',
    },
    {
        id: 4,
        title: 'News Article 4',
        description: 'This is the description for news article 4.',
        date: '2023-10-04',
        image: '/path/to/image4.jpg',
    },
    {
        id: 5,
        title: 'News Article 5',
        description: 'This is the description for news article 5.',
        date: '2023-10-05',
        image: '/path/to/image5.jpg',
    },
    {
        id: 6,
        title: 'News Article 6',
        description: 'This is the description for news article 6.',
        date: '2023-10-06',
        image: '/path/to/image6.jpg',
    },
];

const NewsListingPage: React.FC = () => {
    const [newsData, setNewsData] = useState(staticNewsData);
    const [page, setPage] = useState(1);
    const [showOptions, setShowOptions] = useState<number | null>(null); // Track which article's options to show
    const itemsPerPage = 3;

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

    const paginatedNewsData = newsData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleDelete = (id: number) => {
        setNewsData(newsData.filter(news => news.id !== id));
        setShowOptions(null); // Close options menu after deletion
    };

    const handleUpdate = (id: number) => {
        alert(`Update functionality for article with ID: ${id}`);
        setShowOptions(null); // Close options menu after update
    };

    return (
        <div>
            <div className="space-y-4">
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
                            {paginatedNewsData.map((news) => (
                                <tr key={news.id} className="border-b hover:bg-gray-100">
                                    <td className="px-4 py-2">{news.id}</td>
                                    <td className="px-4 py-2">
                                        <img src={news.image} alt={news.title} className="w-16 h-16 object-cover" />
                                    </td>
                                    <td className="px-4 py-2">{news.title}</td>
                                    <td className="px-4 py-2">{news.description}</td>
                                    <td className="px-4 py-2">{news.date}</td>
                                    <td className="px-4 py-2 space-x-2">
                                        <Button
                                            onClick={() => setShowOptions(showOptions === news.id ? null : news.id)}
                                            className="bg-gray-300 text-black"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        {showOptions === news.id && (
                                            <div className="mt-2">
                                                <Button
                                                    onClick={() => handleUpdate(news.id)}
                                                    className="bg-blue-500 text-white"
                                                >
                                                    Update
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(news.id)}
                                                    className="bg-red-500 text-white"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
