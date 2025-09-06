import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Eye } from 'lucide-react';
import createGoogleSheetsService from '../utils/googleSheets';

interface InstagramPost {
    user_id: string;
    url: string;
    title: string;
    description: string;
    likes: number;
    views: number;
    comments: number;
    date_uploaded: string;
}

interface PageWithMetrics {
    pageName: string;
    totalViews: number;
    postCount: number;
    posts: InstagramPost[];
}

const PageScoreboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [pages, setPages] = useState<PageWithMetrics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPageScoreboardData();
    }, []);

    const fetchPageScoreboardData = async () => {
        try {
            setLoading(true);
            console.log('Fetching page scoreboard data from Google Sheets...');

            // Fetch all Instagram posts from Google Sheets
            const googleSheetsService = createGoogleSheetsService();
            const allPosts = await googleSheetsService.fetchMetrics();
            console.log('Fetched posts from Google Sheets:', allPosts);

            // Group posts by page name (from Google Sheets "Page's name" column)
            // The page name is stored in the title field from Google Sheets
            const pageMap = new Map<string, InstagramPost[]>();

            allPosts.forEach(post => {
                // Use the title field which contains the "Page's name" from Google Sheets
                const pageName = post.title || 'Untitled Page';

                if (!pageMap.has(pageName)) {
                    pageMap.set(pageName, []);
                }
                pageMap.get(pageName)!.push(post);
            });

            // Create pages with aggregated metrics
            const pagesWithMetrics: PageWithMetrics[] = Array.from(pageMap.entries()).map(([pageName, posts]) => {
                const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

                return {
                    pageName,
                    totalViews,
                    postCount: posts.length,
                    posts
                };
            });

            // Sort by total views (descending)
            const sortedPages = pagesWithMetrics.sort((a, b) => b.totalViews - a.totalViews);

            console.log('=== PAGE SCOREBOARD DEBUG ===');
            console.log('Calculated page metrics:', sortedPages);
            console.log('Number of pages with metrics:', sortedPages.length);
            sortedPages.forEach((page, index) => {
                console.log(`Page ${index + 1}: ${page.pageName} - ${page.totalViews} views, ${page.postCount} posts`);
            });

            setPages(sortedPages);
        } catch (error) {
            console.error('Error fetching page scoreboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <Trophy className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <Trophy className="w-6 h-6 text-orange-600" />;
        return <span className="text-gray-400 font-bold text-lg">#{index + 1}</span>;
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Page's Scoreboard</h1>
                        <p className="text-gray-300 mt-2">See which pages are performing best</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg font-medium">
                                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <span className="text-gray-300 font-medium text-lg">
                            {currentUser?.email || 'user@gmail.com'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Page Scoreboard Table */}
            <div className="bg-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-600">
                            <tr>
                                <th className="px-8 py-6 text-left text-lg font-medium text-gray-300">Rank</th>
                                <th className="px-8 py-6 text-left text-lg font-medium text-gray-300">Page Name</th>
                                <th className="px-8 py-6 text-center text-lg font-medium text-gray-300">
                                    <div className="flex items-center justify-center">
                                        <Eye className="w-5 h-5 mr-2 text-blue-400" />
                                        Total Views
                                    </div>
                                </th>
                                <th className="px-8 py-6 text-center text-lg font-medium text-gray-300">Posts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                            {pages.map((page, index) => (
                                <tr
                                    key={page.pageName}
                                    className="hover:bg-gray-600 transition-colors"
                                >
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getRankIcon(index)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                                                <span className="text-white font-bold text-lg">
                                                    {page.pageName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-lg font-medium text-white">
                                                    {page.pageName}
                                                </div>
                                                <div className="text-base text-gray-400">
                                                    {page.postCount} post{page.postCount !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-center">
                                        <span className="text-2xl font-bold text-blue-400">
                                            {formatNumber(page.totalViews)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-center">
                                        <span className="text-2xl font-bold text-purple-400">
                                            {page.postCount}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty State */}
            {pages.length === 0 && (
                <div className="text-center py-16">
                    <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-white mb-4">No Pages Yet</h3>
                    <p className="text-gray-400 text-lg">
                        Upload some Instagram links with page names to start competing!
                    </p>
                </div>
            )}
        </div>
    );
};

export default PageScoreboard;
