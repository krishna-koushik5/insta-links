import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, InstagramLink } from '../../config/supabase';
import { Plus, ExternalLink, Trash2, Edit, Instagram } from 'lucide-react';

const UserDashboard: React.FC = () => {
    const { currentUser, userProfile } = useAuth();
    const [links, setLinks] = useState<InstagramLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLink, setNewLink] = useState({ url: '', title: '', description: '' });
    const [editingLink, setEditingLink] = useState<InstagramLink | null>(null);

    useEffect(() => {
        fetchLinks();
    }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchLinks = async () => {
        if (!currentUser) return;

        try {
            const { data, error } = await supabase
                .from('instagram_links')
                .select('*')
                .eq('user_id', currentUser.uid)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching links:', error);
                return;
            }

            setLinks(data || []);
        } catch (error) {
            console.error('Error fetching links:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !newLink.url) return;

        try {
            const { data, error } = await supabase
                .from('instagram_links')
                .insert([
                    {
                        user_id: currentUser.uid,
                        url: newLink.url,
                        title: newLink.title || null,
                        description: newLink.description || null,
                        date_uploaded: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Error adding link:', error);
                return;
            }

            setLinks([data, ...links]);
            setNewLink({ url: '', title: '', description: '' });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding link:', error);
        }
    };

    const handleUpdateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLink) return;

        try {
            const { data, error } = await supabase
                .from('instagram_links')
                .update({
                    url: editingLink.url,
                    title: editingLink.title || null,
                    description: editingLink.description || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingLink.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating link:', error);
                return;
            }

            setLinks(links.map(link => link.id === editingLink.id ? data : link));
            setEditingLink(null);
        } catch (error) {
            console.error('Error updating link:', error);
        }
    };

    const handleDeleteLink = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this link?')) return;

        try {
            const { error } = await supabase
                .from('instagram_links')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting link:', error);
                return;
            }

            setLinks(links.filter(link => link.id !== id));
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    };

    const isValidInstagramUrl = (url: string) => {
        const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?/;
        return instagramRegex.test(url);
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
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome, {userProfile?.display_name || currentUser?.email}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your Instagram showcase links
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Instagram Link
                        </button>
                    </div>

                    {/* Add Link Form */}
                    {showAddForm && (
                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Instagram Link</h3>
                            <form onSubmit={handleAddLink} className="space-y-4">
                                <div>
                                    <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                                        Instagram URL *
                                    </label>
                                    <input
                                        type="url"
                                        id="url"
                                        value={newLink.url}
                                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="https://www.instagram.com/p/..."
                                        required
                                    />
                                    {newLink.url && !isValidInstagramUrl(newLink.url) && (
                                        <p className="mt-1 text-sm text-red-600">Please enter a valid Instagram post URL</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Title (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={newLink.title}
                                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Give your post a title"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        value={newLink.description}
                                        onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Describe your work or this post"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isValidInstagramUrl(newLink.url)}
                                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Link
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Edit Link Form */}
                    {editingLink && (
                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Instagram Link</h3>
                            <form onSubmit={handleUpdateLink} className="space-y-4">
                                <div>
                                    <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700">
                                        Instagram URL *
                                    </label>
                                    <input
                                        type="url"
                                        id="edit-url"
                                        value={editingLink.url}
                                        onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                                        Title (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-title"
                                        value={editingLink.title || ''}
                                        onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="edit-description"
                                        rows={3}
                                        value={editingLink.description || ''}
                                        onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingLink(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                                    >
                                        Update Link
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Links Grid */}
                    {links.length === 0 ? (
                        <div className="text-center py-12">
                            <Instagram className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Instagram links</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by adding your first Instagram showcase link.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Instagram Link
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {links.map((link) => (
                                <div key={link.id} className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Instagram className="h-5 w-5 text-instagram-500" />
                                                <span className="ml-2 text-sm font-medium text-gray-900">
                                                    {link.title || 'Instagram Post'}
                                                </span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setEditingLink(link)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLink(link.id)}
                                                    className="text-gray-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {link.description && (
                                            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                                                {link.description}
                                            </p>
                                        )}
                                        <div className="mt-4">
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
                                            >
                                                View on Instagram
                                                <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            Added {new Date(link.date_uploaded).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
