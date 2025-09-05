import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Instagram, LogOut, User } from 'lucide-react';

const Navigation: React.FC = () => {
    const { currentUser, userProfile, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center">
                            <Instagram className="h-8 w-8 text-instagram-500" />
                            <span className="ml-2 text-xl font-bold text-gray-900">
                                Instagram Showcase
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Admin Dashboard
                            </Link>
                        )}

                        <Link
                            to="/dashboard"
                            className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            My Dashboard
                        </Link>

                        <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {userProfile?.display_name || currentUser?.email}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
