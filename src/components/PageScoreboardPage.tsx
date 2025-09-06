import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageScoreboard from './PageScoreboard';
import HamburgerMenu from './HamburgerMenu';
import { Menu, Home } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PageScoreboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hamburger Menu Button - Fixed Position */}
            <button
                onClick={() => setIsMenuOpen(true)}
                className="fixed top-4 left-4 z-30 p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gray-900/80 backdrop-blur-sm"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Header with Home Button and Gmail Display */}
            <header className="bg-gray-900 shadow-lg border-b border-gray-800">
                <div className="max-w-[95vw] mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="flex justify-between items-center h-20">
                        {/* Home Button */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                        >
                            <Home className="h-5 w-5" />
                            <span className="font-medium">Home</span>
                        </button>

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

            {/* Main Content */}
            <div className="max-w-[95vw] mx-auto px-6 sm:px-8 lg:px-12 py-12">
                <PageScoreboard />
            </div>

            {/* Hamburger Menu */}
            <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    );
};

export default PageScoreboardPage;
