import React, { useState } from 'react';
import { Upload, Link as LinkIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface LinkUploadProps {
    onUploadSuccess?: (linkData: any) => void;
}

const LinkUpload: React.FC<LinkUploadProps> = ({ onUploadSuccess }) => {
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
    const { currentUser } = useAuth();

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

        if (!title.trim()) {
            setMessage({ type: 'error', text: 'Please enter a page name' });
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

            await addDoc(collection(db, 'user_links'), linkData);

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

    return (
        <div className="bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
                <div className="bg-instagram-500 p-3 rounded-full">
                    <Upload className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white ml-4">
                    Upload Instagram Link
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    {/* Link URL Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="Paste your Instagram link here..."
                            className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-instagram-500 focus:border-transparent"
                            disabled={isUploading}
                        />
                        {link && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                disabled={isUploading}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Page's Name Input */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Page's name *"
                        required
                        className="w-full py-3 px-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-instagram-500 focus:border-transparent"
                        disabled={isUploading}
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        type="submit"
                        disabled={isUploading || !link.trim() || !title.trim()}
                        className="flex-1 bg-instagram-500 hover:bg-instagram-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                        {isUploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
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

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                    Supported: Instagram posts, reels, stories, and profile links
                </p>
            </div>
        </div>
    );
};

export default LinkUpload;
