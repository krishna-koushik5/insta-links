import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, InstagramLink, User } from '../../config/supabase';
import { Users, Instagram, BarChart3, Trash2, Eye, Calendar } from 'lucide-react';

interface UserWithLinks extends User {
    links: InstagramLink[];
    totalLinks: number;
}

const AdminDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [users, setUsers] = useState<UserWithLinks[]>([]);
    const [, setAllLinks] = useState<InstagramLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserWithLinks | null>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLinks: 0,
        activeUsers: 0,
        recentLinks: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) {
                console.error('Error fetching users:', usersError);
                return;
            }

            // Fetch all Instagram links
            const { data: linksData, error: linksError } = await supabase
                .from('instagram_links')
                .select('*')
                .order('created_at', { ascending: false });

            if (linksError) {
                console.error('Error fetching links:', linksError);
                return;
            }

            // Combine users with their links
            const usersWithLinks = usersData.map(user => {
                const userLinks = linksData.filter(link => link.user_id === user.id);
                return {
                    ...user,
                    links: userLinks,
                    totalLinks: userLinks.length
                };
            });

            setUsers(usersWithLinks);
            setAllLinks(linksData || []);

            // Calculate stats
            const now = new Date();
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            setStats({
                totalUsers: usersData.length,
                totalLinks: linksData.length,
                activeUsers: usersWithLinks.filter(user => user.totalLinks > 0).length,
                recentLinks: linksData.filter(link => new Date(link.created_at) > lastWeek).length
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        if (!window.confirm('Are you sure you want to delete this link?')) return;

        try {
            const { error } = await supabase
                .from('instagram_links')
                .delete()
                .eq('id', linkId);

            if (error) {
                console.error('Error deleting link:', error);
                return;
            }

            // Refresh data
            fetchData();
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    };

    const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ is_admin: !currentStatus })
                .eq('id', userId);

            if (error) {
                console.error('Error updating user:', error);
                return;
            }

            // Refresh data
            fetchData();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-2 text-gray-600">
                            Welcome, {userProfile?.display_name || userProfile?.email}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Users
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.totalUsers}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Instagram className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Links
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.totalLinks}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <BarChart3 className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Active Users
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.activeUsers}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Calendar className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Recent Links (7d)
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.recentLinks}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Users Management
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Manage users and their Instagram links
                            </p>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <li key={user.id}>
                                    <div className="px-4 py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.display_name?.charAt(0) || user.email?.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.display_name || 'No name'}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                <div className="text-xs text-gray-400">
                                                    {user.totalLinks} Instagram links
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_admin
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.is_admin ? 'Admin' : 'User'}
                                            </span>
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                                                className="text-sm text-primary-600 hover:text-primary-500"
                                            >
                                                {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="text-sm text-primary-600 hover:text-primary-500"
                                            >
                                                View Links
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* User Links Modal */}
                    {selectedUser && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {selectedUser.display_name || selectedUser.email}'s Instagram Links
                                        </h3>
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {selectedUser.links.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No Instagram links found</p>
                                    ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {selectedUser.links.map((link) => (
                                                <div key={link.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {link.title || 'Instagram Post'}
                                                            </h4>
                                                            {link.description && (
                                                                <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                                                            )}
                                                            <a
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-primary-600 hover:text-primary-500 mt-2 inline-flex items-center"
                                                            >
                                                                View on Instagram
                                                                <Eye className="ml-1 h-3 w-3" />
                                                            </a>
                                                            <p className="text-xs text-gray-400 mt-2">
                                                                Added {new Date(link.date_uploaded).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteLink(link.id)}
                                                            className="text-red-400 hover:text-red-600 ml-2"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
