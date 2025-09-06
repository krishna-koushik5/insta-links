import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    X,
    BarChart3,
    Home,
    LogOut
} from 'lucide-react';

interface HamburgerMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            onClose();
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Menu Dropdown */}
            <div className="fixed top-4 left-4 w-64 bg-gray-900 rounded-lg shadow-xl z-50 border border-gray-700">
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">
                                    {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Menu</h2>
                                <p className="text-xs text-gray-400 truncate max-w-32">{currentUser?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-2">
                        <nav className="space-y-1">
                            <button
                                onClick={() => handleNavigation('/dashboard')}
                                className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <Home className="w-4 h-4 mr-3" />
                                <span className="font-medium text-sm">Home</span>
                            </button>

                            <button
                                onClick={() => handleNavigation('/metrics')}
                                className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <BarChart3 className="w-4 h-4 mr-3" />
                                <span className="font-medium text-sm">Personal Metrics</span>
                            </button>
                        </nav>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-700 p-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors rounded-lg"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HamburgerMenu;
