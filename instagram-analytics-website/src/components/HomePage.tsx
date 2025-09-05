import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import LinkUpload from './LinkUpload';
import { testSupabaseConnection, testSupabaseAuth } from '../utils/testSupabase';

const HomePage: React.FC = () => {
    const { currentUser, userProfile, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-white">
                                Instagram Showcase
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">
                                    {userProfile?.display_name || currentUser?.email}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-gray-300 hover:text-white p-2 rounded-md"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Welcome to Your Dashboard!
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Upload and manage your Instagram links
                    </p>

                    {/* Link Upload Component */}
                    <div className="mb-12">
                        <LinkUpload onUploadSuccess={(linkData) => {
                            console.log('Link uploaded successfully:', linkData);
                        }} />
                    </div>

                    <div className="bg-gray-900 rounded-lg p-8 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-semibold text-white mb-4">
                            User Information
                        </h3>
                        <div className="space-y-2 text-left">
                            <p className="text-gray-300">
                                <span className="font-medium text-white">Email:</span> {currentUser?.email}
                            </p>
                            <p className="text-gray-300">
                                <span className="font-medium text-white">User ID:</span> {currentUser?.uid}
                            </p>
                            <p className="text-gray-300">
                                <span className="font-medium text-white">Display Name:</span> {userProfile?.display_name || 'Not set'}
                            </p>
                            <p className="text-gray-300">
                                <span className="font-medium text-white">Admin Status:</span> {userProfile?.is_admin ? 'Admin' : 'Regular User'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <p className="text-gray-400">
                            Upload your Instagram links to get started with the showcase!
                        </p>

                        {/* Test Supabase Connection */}
                        <div className="flex space-x-4 justify-center">
                            <button
                                onClick={testSupabaseConnection}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                            >
                                Test Supabase Connection
                            </button>
                            <button
                                onClick={testSupabaseAuth}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                            >
                                Test Supabase Auth
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
