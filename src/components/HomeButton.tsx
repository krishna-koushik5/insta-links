import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const HomeButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/dashboard')}
            className="fixed top-4 left-4 z-30 p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gray-900/80 backdrop-blur-sm"
            title="Go to Home"
        >
            <Home className="h-6 w-6" />
        </button>
    );
};

export default HomeButton;
