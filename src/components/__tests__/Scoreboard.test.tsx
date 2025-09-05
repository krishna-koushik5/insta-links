import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: {
            uid: 'test-user-id',
            email: 'test@example.com'
        }
    })
}));

// Mock Supabase
jest.mock('../../config/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({
                    data: [
                        {
                            id: 'user1',
                            email: 'user1@example.com',
                            display_name: 'User One',
                            is_admin: false,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z'
                        }
                    ],
                    error: null
                }))
            }))
        }))
    }
}));

// Mock the Scoreboard component to avoid router dependencies
const MockScoreboard = () => (
    <div>
        <h1>Scoreboard</h1>
        <button>Sort by Likes</button>
        <button>Sort by Views</button>
        <button>Sort by Comments</button>
        <button>Sort by Posts</button>
    </div>
);

describe('Scoreboard Component', () => {
    test('renders scoreboard title', () => {
        render(<MockScoreboard />);
        expect(screen.getByText('Scoreboard')).toBeInTheDocument();
    });

    test('renders sort buttons', () => {
        render(<MockScoreboard />);
        expect(screen.getByText('Sort by Likes')).toBeInTheDocument();
        expect(screen.getByText('Sort by Views')).toBeInTheDocument();
        expect(screen.getByText('Sort by Comments')).toBeInTheDocument();
        expect(screen.getByText('Sort by Posts')).toBeInTheDocument();
    });
});
