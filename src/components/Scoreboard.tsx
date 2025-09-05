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

interface UserWithMetrics {
    id: string;
    email: string;
    display_name: string;
    created_at: string;
    updated_at: string;
    is_admin: boolean;
    totalLikes: number;
    totalViews: number;
    totalComments: number;
    totalPosts: number;
    links: InstagramPost[];
}

const Scoreboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState<UserWithMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'likes' | 'views' | 'comments' | 'posts'>('views');

    useEffect(() => {
        fetchScoreboardData();
    }, []);

    const fetchScoreboardData = async () => {
        try {
            setLoading(true);
            console.log('Fetching scoreboard data from Google Sheets...');

            // Fetch all Instagram posts from Google Sheets
            const googleSheetsService = createGoogleSheetsService();
            const allPosts = await googleSheetsService.fetchMetrics();
            console.log('Fetched posts from Google Sheets:', allPosts);

            // Create users from Google Sheets data
            console.log('Creating users from Google Sheets data...');
            const emailSet = new Set<string>();
            allPosts.forEach(post => {
                if (post.user_id) {
                    emailSet.add(post.user_id);
                }
            });
            const uniqueEmails = Array.from(emailSet);

            const usersWithMetrics: UserWithMetrics[] = uniqueEmails.map((email, index) => {
                const userPosts = allPosts.filter(post =>
                    post.user_id && email &&
                    post.user_id.toLowerCase() === email.toLowerCase()
                );
                const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
                const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
                const totalComments = userPosts.reduce((sum, post) => sum + (post.comments || 0), 0);

                return {
                    id: `user-${index}`,
                    email: email,
                    display_name: email.split('@')[0],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_admin: false,
                    totalLikes,
                    totalViews,
                    totalComments,
                    totalPosts: userPosts.length,
                    links: userPosts
                };
            });

            console.log('=== SCOREBOARD DEBUG ===');
            console.log('Calculated user metrics:', usersWithMetrics);
            console.log('Number of users with metrics:', usersWithMetrics.length);
            usersWithMetrics.forEach((user, index) => {
                console.log(`User ${index + 1}: ${user.email} - ${user.totalViews} views, ${user.totalPosts} posts`);
            });
            setUsers(usersWithMetrics);
        } catch (error) {
            console.error('Error fetching scoreboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getSortedUsers = () => {
        return [...users].sort((a, b) => {
            switch (sortBy) {
                case 'likes':
                    return b.totalLikes - a.totalLikes;
                case 'views':
                    return b.totalViews - a.totalViews;
                case 'comments':
                    return b.totalComments - a.totalComments;
                case 'posts':
                    return b.totalPosts - a.totalPosts;
                default:
                    return 0;
            }
        });
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <Trophy className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <Trophy className="w-6 h-6 text-orange-600" />;
        return <span className="text-gray-400 font-bold text-lg">#{index + 1}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Scoreboard</h1>
                            <p className="text-gray-300 mt-2">See how everyone is performing</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span className="text-gray-300 font-medium">
                                {currentUser?.email || 'user@gmail.com'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setSortBy('views')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${sortBy === 'views'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        <Eye className="w-4 h-4 mr-2 inline" />
                        Views
                    </button>
                    <button
                        onClick={() => setSortBy('likes')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${sortBy === 'likes'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        <Trophy className="w-4 h-4 mr-2 inline" />
                        Likes
                    </button>
                    <button
                        onClick={() => setSortBy('comments')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${sortBy === 'comments'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        <Trophy className="w-4 h-4 mr-2 inline" />
                        Comments
                    </button>
                    <button
                        onClick={() => setSortBy('posts')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${sortBy === 'posts'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        <Trophy className="w-4 h-4 mr-2 inline" />
                        Posts
                    </button>
                </div>

                {/* Scoreboard Table */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Rank</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">
                                        <div className="flex items-center justify-center">
                                            <Eye className="w-4 h-4 mr-2 text-blue-400" />
                                            Views
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">
                                        <div className="flex items-center justify-center">
                                            <Trophy className="w-4 h-4 mr-2 text-red-400" />
                                            Likes
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">
                                        <div className="flex items-center justify-center">
                                            <Trophy className="w-4 h-4 mr-2 text-green-400" />
                                            Comments
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">
                                        <div className="flex items-center justify-center">
                                            <Trophy className="w-4 h-4 mr-2 text-purple-400" />
                                            Posts
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {getSortedUsers().map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className={`hover:bg-gray-700 transition-colors ${user.id === currentUser?.uid ? 'bg-blue-900/20' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getRankIcon(index)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-white font-bold">
                                                        {user.display_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {user.display_name || user.email.split('@')[0]}
                                                    </div>
                                                    <div className="text-sm text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-xl font-bold text-blue-400">
                                                {formatNumber(user.totalViews)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-xl font-bold text-red-400">
                                                {formatNumber(user.totalLikes)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-xl font-bold text-green-400">
                                                {formatNumber(user.totalComments)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-xl font-bold text-purple-400">
                                                {user.totalPosts}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {users.length === 0 && (
                    <div className="text-center py-12">
                        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Users Yet</h3>
                        <p className="text-gray-400">
                            Be the first to upload an Instagram link and start competing!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scoreboard;
