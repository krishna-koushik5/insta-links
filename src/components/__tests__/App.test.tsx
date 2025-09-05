import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the AuthProvider to avoid Firebase dependency in tests
jest.mock('../contexts/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAuth: () => ({
        currentUser: null,
        userProfile: null,
        loading: false,
        signup: jest.fn(),
        login: jest.fn(),
        loginWithGoogle: jest.fn(),
        logout: jest.fn(),
        isAdmin: false
    })
}));

const AppWithRouter = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

test('renders landing page', () => {
    render(<AppWithRouter />);
    const heading = screen.getByText(/Showcase Your/i);
    expect(heading).toBeInTheDocument();
});

test('renders sign in link', () => {
    render(<AppWithRouter />);
    const signInLink = screen.getByText(/Sign In/i);
    expect(signInLink).toBeInTheDocument();
});

test('renders get started button', () => {
    render(<AppWithRouter />);
    const getStartedButton = screen.getByText(/Get Started/i);
    expect(getStartedButton).toBeInTheDocument();
});
