import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Upload, Link as LinkIcon, X, CheckCircle, AlertCircle, Eye, ExternalLink } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import Scoreboard from './Scoreboard';
import HamburgerMenu from './HamburgerMenu';
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

const HomePage: React.FC = () => {
    const { currentUser } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
    const [topReels, setTopReels] = useState<InstagramPost[]>([]);
    const [loadingReels, setLoadingReels] = useState(true);

    const fetchTopReels = async () => {
        try {
            setLoadingReels(true);
            console.log('Fetching top reels...');
            const googleSheetsService = createGoogleSheetsService();
            const allPosts = await googleSheetsService.fetchMetrics();

            console.log('All posts fetched:', allPosts);

            // Sort by views (descending) and take top 5
            const sortedPosts = allPosts
                .sort((a, b) => b.views - a.views)
                .slice(0, 5);

            console.log('Top 5 reels:', sortedPosts);
            setTopReels(sortedPosts);
        } catch (error) {
            console.error('Error fetching top reels:', error);
        } finally {
            setLoadingReels(false);
        }
    };

    useEffect(() => {
        fetchTopReels();
    }, []);

    const validateUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!link.trim()) {
            setMessage({ type: 'error', text: 'Please enter a link' });
            return;
        }

        if (!validateUrl(link)) {
            setMessage({ type: 'error', text: 'Please enter a valid URL' });
            return;
        }

        if (!currentUser) {
            setMessage({ type: 'error', text: 'You must be logged in to upload links' });
            return;
        }

        setIsUploading(true);
        setMessage({ type: null, text: '' });

        try {
            const linkData = {
                user_id: currentUser.uid,
                user_email: currentUser.email,
                link_url: link.trim(),
                title: title.trim() || '',
                is_active: true,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'user_links'), linkData);
            setMessage({ type: 'success', text: 'Link uploaded successfully!' });

            // Clear form
            setLink('');
            setTitle('');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage({ type: null, text: '' });
            }, 3000);

        } catch (error) {
            console.error('Error uploading link:', error);
            setMessage({ type: 'error', text: 'Failed to upload link. Please try again.' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = () => {
        setLink('');
        setTitle('');
        setMessage({ type: null, text: '' });
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hamburger Menu Button - Fixed Position */}
            <button
                onClick={() => setIsMenuOpen(true)}
                className="fixed top-4 left-4 z-30 p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gray-900/80 backdrop-blur-sm"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Header with Gmail Display */}
            <header className="bg-gray-900 shadow-lg border-b border-gray-800">
                <div className="max-w-[95vw] mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="flex justify-end items-center h-20">
                        {/* Gmail Display */}
                        <div className="flex items-center space-x-3">
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
            </header>

            {/* Main Content - Upload Form, Scoreboard, and Top 5 Reels */}
            <div className="max-w-[95vw] mx-auto px-6 sm:px-8 lg:px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Upload Form - Left Side */}
                    <div className="lg:col-span-3 xl:col-span-3">
                        <div className="bg-gray-800 rounded-lg p-8 sticky top-8">
                            <div className="flex items-center justify-center mb-8">
                                <div className="bg-blue-600 p-4 rounded-full">
                                    <Upload className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white ml-4">
                                    Upload Link
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6" role="form">
                                <div className="space-y-6">
                                    {/* Link URL Input */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <LinkIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder="Paste your Instagram link here..."
                                            className="w-full pl-12 pr-14 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                            disabled={isUploading}
                                        />
                                        {link && (
                                            <button
                                                type="button"
                                                onClick={handleClear}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
                                                disabled={isUploading}
                                            >
                                                <X className="h-6 w-6" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Title Input */}
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Title (optional)"
                                        className="w-full py-4 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                        disabled={isUploading}
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={isUploading || !link.trim()}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center text-lg"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-5 w-5 mr-3" />
                                                Upload Link
                                            </>
                                        )}
                                    </button>
                                </div>

                                {message.type && (
                                    <div className={`flex items-center space-x-2 p-3 rounded-lg ${message.type === 'success'
                                        ? 'bg-green-900/20 border border-green-500/30 text-green-400'
                                        : 'bg-red-900/20 border border-red-500/30 text-red-400'
                                        }`}>
                                        {message.type === 'success' ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5" />
                                        )}
                                        <span className="text-sm">{message.text}</span>
                                    </div>
                                )}
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-base text-gray-400">
                                    Supported: Instagram posts, reels, stories, and profile links
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scoreboard - Middle */}
                    <div className="lg:col-span-6 xl:col-span-6">
                        <Scoreboard />
                    </div>

                    {/* Top 5 Reels - Right Side */}
                    <div className="lg:col-span-3 xl:col-span-3">
                        <div className="bg-gray-800 rounded-lg p-8 sticky top-8">
                            <div className="flex items-center justify-center mb-8">
                                <div className="bg-yellow-600 p-4 rounded-full">
                                    <Eye className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white ml-4">
                                    Top 5 Reels
                                </h3>
                            </div>

                            {loadingReels ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                                </div>
                            ) : topReels.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {topReels.map((reel, index) => (
                                        <div key={index} className="bg-gray-700 rounded-lg p-5 hover:bg-gray-600 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                    <div className="text-center text-white">
                                                        <div className="text-lg font-bold">#{index + 1}</div>
                                                    </div>
                                                    <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                                                        <ExternalLink className="h-3 w-3 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium text-base truncate">
                                                        {reel.title || 'Untitled Post'}
                                                    </h4>
                                                    <div className="flex items-center justify-between text-sm text-gray-400 mt-2">
                                                        <span className="flex items-center">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            {formatNumber(reel.views)}
                                                        </span>
                                                        <span className="text-yellow-400 font-medium">
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                    <a
                                                        href={reel.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded text-sm font-medium transition-colors"
                                                    >
                                                        View Reel
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 text-base">No reels available yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hamburger Menu */}
            <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    );
};

export default HomePage;
