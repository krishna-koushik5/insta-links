import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Heart, Eye, MessageCircle, TrendingUp, Calendar, Plus, Trophy } from 'lucide-react';
import createGoogleSheetsService from '../utils/googleSheets';
import HomeButton from './HomeButton';

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

interface UserMetrics {
    totalPosts: number;
    totalLikes: number;
    totalViews: number;
    totalComments: number;
    averageLikes: number;
    averageViews: number;
    averageComments: number;
    recentPosts: InstagramPost[];
    position: number;
    totalUsers: number;
}

const PersonalMetrics: React.FC = () => {
    const { currentUser } = useAuth();
    const [metrics, setMetrics] = useState<UserMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingSampleData, setAddingSampleData] = useState(false);

    const fetchPersonalMetrics = useCallback(async () => {
        try {
            setLoading(true);
            console.log('=== PERSONAL METRICS DEBUG ===');
            console.log('Fetching personal metrics from Google Sheets for user:', currentUser?.uid);
            console.log('Current user email:', currentUser?.email);
            console.log('Environment variables check:');
            console.log('REACT_APP_GOOGLE_SHEETS_ID:', process.env.REACT_APP_GOOGLE_SHEETS_ID);
            console.log('REACT_APP_GOOGLE_SHEETS_API_KEY:', process.env.REACT_APP_GOOGLE_SHEETS_API_KEY ? 'Present' : 'Missing');

            const googleSheetsService = createGoogleSheetsService();
            const allPosts = await googleSheetsService.fetchMetrics();

            console.log('Fetched all posts from Google Sheets:', allPosts);
            console.log('Number of posts fetched:', allPosts.length);

            // Filter posts for current user by email address (case-insensitive)
            const userPosts = allPosts.filter(post =>
                post.user_id && currentUser?.email &&
                post.user_id.toLowerCase() === currentUser.email.toLowerCase()
            );
            console.log('Filtered posts for current user by email:', userPosts);
            console.log('User email for filtering:', currentUser?.email);
            console.log('Post user_ids in sheet:', allPosts.map(p => p.user_id));

            const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
            const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
            const totalComments = userPosts.reduce((sum, post) => sum + (post.comments || 0), 0);

            // Calculate scoreboard position
            const uniqueEmails = Array.from(new Set(allPosts.map(post => post.user_id).filter(Boolean)));
            const usersWithMetrics: UserWithMetrics[] = uniqueEmails.map((email, index) => {
                const userPosts = allPosts.filter(post =>
                    post.user_id && email &&
                    post.user_id.toLowerCase() === email.toLowerCase()
                );

                const userTotalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
                const userTotalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
                const userTotalComments = userPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
                const userTotalPosts = userPosts.length;

                return {
                    id: `user_${index}`,
                    email: email,
                    display_name: email.split('@')[0],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_admin: false,
                    totalLikes: userTotalLikes,
                    totalViews: userTotalViews,
                    totalComments: userTotalComments,
                    totalPosts: userTotalPosts,
                    links: userPosts
                };
            });

            // Sort users by total views (descending)
            usersWithMetrics.sort((a, b) => b.totalViews - a.totalViews);

            // Find current user's position
            const currentUserPosition = usersWithMetrics.findIndex(user =>
                user.email.toLowerCase() === currentUser?.email?.toLowerCase()
            );
            const position = currentUserPosition !== -1 ? currentUserPosition + 1 : usersWithMetrics.length + 1;
            const totalUsers = usersWithMetrics.length;

            const metricsData = {
                totalPosts: userPosts.length,
                totalLikes,
                totalViews,
                totalComments,
                averageLikes: userPosts.length > 0 ? Math.round(totalLikes / userPosts.length) : 0,
                averageViews: userPosts.length > 0 ? Math.round(totalViews / userPosts.length) : 0,
                averageComments: userPosts.length > 0 ? Math.round(totalComments / userPosts.length) : 0,
                recentPosts: userPosts.slice(0, 5),
                position,
                totalUsers
            };

            console.log('Calculated metrics from Google Sheets:', metricsData);
            setMetrics(metricsData);
        } catch (error) {
            console.error('=== ERROR FETCHING PERSONAL METRICS ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            // Set empty metrics on error
            setMetrics({
                totalPosts: 0,
                totalLikes: 0,
                totalViews: 0,
                totalComments: 0,
                averageLikes: 0,
                averageViews: 0,
                averageComments: 0,
                recentPosts: [],
                position: 0,
                totalUsers: 0
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, currentUser?.email]);

    useEffect(() => {
        if (currentUser?.uid) {
            fetchPersonalMetrics();
        }
    }, [currentUser?.uid, fetchPersonalMetrics]);

    const handleAddSampleData = async () => {
        if (!currentUser?.uid) return;

        try {
            setAddingSampleData(true);
            const googleSheetsService = createGoogleSheetsService();

            // Add sample posts to Google Sheets
            const samplePosts: InstagramPost[] = [
                {
                    user_id: currentUser.email || '',
                    url: 'https://instagram.com/p/sample1',
                    title: 'Amazing Sunset Photo',
                    description: 'Beautiful sunset from my vacation',
                    likes: 1250,
                    views: 5600,
                    comments: 89,
                    date_uploaded: new Date().toISOString()
                },
                {
                    user_id: currentUser.email || '',
                    url: 'https://instagram.com/p/sample2',
                    title: 'Food Photography',
                    description: 'Delicious homemade pasta',
                    likes: 890,
                    views: 3200,
                    comments: 45,
                    date_uploaded: new Date().toISOString()
                },
                {
                    user_id: currentUser.email || '',
                    url: 'https://instagram.com/p/sample3',
                    title: 'Travel Adventure',
                    description: 'Exploring new places',
                    likes: 2100,
                    views: 8900,
                    comments: 156,
                    date_uploaded: new Date().toISOString()
                }
            ];

            // Add each post to Google Sheets
            for (const post of samplePosts) {
                await googleSheetsService.addPost(post);
            }

            // Refresh metrics after adding sample data
            await fetchPersonalMetrics();
        } catch (error) {
            console.error('Error adding sample data to Google Sheets:', error);
        } finally {
            setAddingSampleData(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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
            {/* Home Button */}
            <HomeButton />

            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Personal Metrics</h1>
                            <p className="text-gray-300 mt-2">Track your Instagram performance</p>
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

            {/* Position Display */}
            {metrics && (
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 mx-4 mt-4 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-3">
                        <Trophy className="w-6 h-6 text-white" />
                        <div className="text-center">
                            <p className="text-white font-bold text-lg">
                                #{metrics.position} of {metrics.totalUsers} users
                            </p>
                            <p className="text-yellow-100 text-sm">
                                Ranked by total views
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {metrics ? (
                    <>
                        {/* Overview Cards - Calculated from Google Sheets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Posts</p>
                                        <p className="text-2xl font-bold text-white">{metrics.totalPosts}</p>
                                        <p className="text-xs text-gray-500 mt-1">From Google Sheets</p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Likes</p>
                                        <p className="text-2xl font-bold text-red-400">{formatNumber(metrics.totalLikes)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Calculated from sheets</p>
                                    </div>
                                    <Heart className="w-8 h-8 text-red-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Views</p>
                                        <p className="text-2xl font-bold text-blue-400">{formatNumber(metrics.totalViews)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Sum of all views</p>
                                    </div>
                                    <Eye className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Comments</p>
                                        <p className="text-2xl font-bold text-green-400">{formatNumber(metrics.totalComments)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Sum of all comments</p>
                                    </div>
                                    <MessageCircle className="w-8 h-8 text-green-400" />
                                </div>
                            </div>
                        </div>

                        {/* Average Performance */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Average Likes</h3>
                                    <TrendingUp className="w-5 h-5 text-red-400" />
                                </div>
                                <p className="text-3xl font-bold text-red-400">{formatNumber(metrics.averageLikes)}</p>
                                <p className="text-sm text-gray-400 mt-2">per post</p>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Average Views</h3>
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                </div>
                                <p className="text-3xl font-bold text-blue-400">{formatNumber(metrics.averageViews)}</p>
                                <p className="text-sm text-gray-400 mt-2">per post</p>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Average Comments</h3>
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                </div>
                                <p className="text-3xl font-bold text-green-400">{formatNumber(metrics.averageComments)}</p>
                                <p className="text-sm text-gray-400 mt-2">per post</p>
                            </div>
                        </div>

                        {/* Recent Posts */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-white mb-6">Recent Posts</h3>

                            {metrics.recentPosts.length > 0 ? (
                                <div className="space-y-4">
                                    {metrics.recentPosts.map((post, index) => (
                                        <div key={`${post.user_id}-${index}`} className="bg-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white font-medium">
                                                    {post.title || 'Untitled Post'}
                                                </h4>
                                                <span className="text-sm text-gray-400 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(post.date_uploaded)}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                                {post.description || 'No description'}
                                            </p>
                                            <div className="flex items-center space-x-6">
                                                <div className="flex items-center text-red-400">
                                                    <Heart className="w-4 h-4 mr-1" />
                                                    <span className="text-sm font-medium">{formatNumber(post.likes || 0)}</span>
                                                </div>
                                                <div className="flex items-center text-blue-400">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    <span className="text-sm font-medium">{formatNumber(post.views || 0)}</span>
                                                </div>
                                                <div className="flex items-center text-green-400">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    <span className="text-sm font-medium">{formatNumber(post.comments || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
                                    <p className="text-gray-400">
                                        Upload your first Instagram link to start tracking your performance!
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* No Data State */
                    <div className="text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
                        <p className="text-gray-400 mb-6">
                            Upload your first Instagram link to start tracking your performance!
                        </p>
                        <button
                            onClick={handleAddSampleData}
                            disabled={addingSampleData}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                        >
                            {addingSampleData ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Adding Sample Data...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Sample Data for Testing
                                </>
                            )}
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Posts</p>
                                        <p className="text-2xl font-bold text-white">0</p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Likes</p>
                                        <p className="text-2xl font-bold text-red-400">0</p>
                                    </div>
                                    <Heart className="w-8 h-8 text-red-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Views</p>
                                        <p className="text-2xl font-bold text-blue-400">0</p>
                                    </div>
                                    <Eye className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Comments</p>
                                        <p className="text-2xl font-bold text-green-400">0</p>
                                    </div>
                                    <MessageCircle className="w-8 h-8 text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalMetrics;
