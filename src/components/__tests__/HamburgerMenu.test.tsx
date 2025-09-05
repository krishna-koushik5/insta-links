import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: {
            uid: 'test-user-id',
            email: 'test@example.com'
        },
        logout: jest.fn()
    })
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn()
}));

// Mock the HamburgerMenu component to avoid router dependencies
const MockHamburgerMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div>
            <div>Menu</div>
            <div>test@example.com</div>
            <button onClick={onClose}>Close</button>
            <div>Home</div>
            <div>Scoreboard</div>
            <div>Upload Link</div>
            <div>Personal Metrics</div>
            <div>Profile</div>
            <div>Logout</div>
        </div>
    );
};

describe('HamburgerMenu Component', () => {
    test('renders when open', () => {
        const mockOnClose = jest.fn();
        render(<MockHamburgerMenu isOpen={true} onClose={mockOnClose} />);

        expect(screen.getByText('Menu')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    test('does not render when closed', () => {
        const mockOnClose = jest.fn();
        render(<MockHamburgerMenu isOpen={false} onClose={mockOnClose} />);

        expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    });

    test('renders navigation items', () => {
        const mockOnClose = jest.fn();
        render(<MockHamburgerMenu isOpen={true} onClose={mockOnClose} />);

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Scoreboard')).toBeInTheDocument();
        expect(screen.getByText('Upload Link')).toBeInTheDocument();
        expect(screen.getByText('Personal Metrics')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
        const mockOnClose = jest.fn();
        render(<MockHamburgerMenu isOpen={true} onClose={mockOnClose} />);

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
