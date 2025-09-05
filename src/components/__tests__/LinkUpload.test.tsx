import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LinkUpload from '../LinkUpload';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
}));

// Mock Firebase config
jest.mock('../../config/firebase', () => ({
    db: {},
}));

// Mock AuthContext
const mockAuthContext = {
    currentUser: {
        uid: 'test-user-id',
        email: 'test@example.com',
    },
    userProfile: null,
    loading: false,
    signup: jest.fn(),
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    isAdmin: false,
};

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockAuthContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('LinkUpload Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders upload form correctly', () => {
        render(<LinkUpload />);

        expect(screen.getByText('Upload Instagram Link')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Paste your Instagram link here...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /upload link/i })).toBeInTheDocument();
    });

    test('validates URL input', async () => {
        render(<LinkUpload />);

        const input = screen.getByPlaceholderText('Paste your Instagram link here...');
        const submitButton = screen.getByRole('button', { name: /upload link/i });

        // Test empty input
        fireEvent.submit(screen.getByRole('form'));
        await waitFor(() => {
            expect(screen.getByText('Please enter a link')).toBeInTheDocument();
        });

        // Clear previous message
        fireEvent.change(input, { target: { value: 'not-a-valid-url' } });

        // Test invalid URL
        fireEvent.submit(screen.getByRole('form'));
        await waitFor(() => {
            expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
        });
    });

    test('shows clear button when input has value', () => {
        render(<LinkUpload />);

        const input = screen.getByPlaceholderText('Paste your Instagram link here...');
        fireEvent.change(input, { target: { value: 'https://instagram.com/test' } });

        expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // Clear button
    });

    test('clears input when clear button is clicked', () => {
        render(<LinkUpload />);

        const input = screen.getByPlaceholderText('Paste your Instagram link here...');
        fireEvent.change(input, { target: { value: 'https://instagram.com/test' } });

        const clearButton = screen.getByRole('button', { name: '' });
        fireEvent.click(clearButton);

        expect(input).toHaveValue('');
    });

    test('disables submit button when input is empty', () => {
        render(<LinkUpload />);

        const submitButton = screen.getByRole('button', { name: /upload link/i });
        expect(submitButton).toBeDisabled();
    });

    test('enables submit button when valid URL is entered', () => {
        render(<LinkUpload />);

        const input = screen.getByPlaceholderText('Paste your Instagram link here...');
        const submitButton = screen.getByRole('button', { name: /upload link/i });

        fireEvent.change(input, { target: { value: 'https://instagram.com/test' } });

        expect(submitButton).not.toBeDisabled();
    });
});
