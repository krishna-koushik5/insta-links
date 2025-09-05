import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { supabase, User } from '../config/supabase';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userProfile: User | null;
    loading: boolean;
    signup: (email: string, password: string, displayName?: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const signup = async (email: string, password: string, displayName?: string) => {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);

        // TODO: Create user profile in Supabase when configured
        // For now, just log success
        console.log('User created successfully:', user.uid);

        // Create user profile in Supabase (temporarily disabled)
        try {
            const { error } = await supabase
                .from('users')
                .insert([
                    {
                        id: user.uid,
                        email: user.email,
                        display_name: displayName || user.displayName,
                        is_admin: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                console.warn('Supabase not configured yet, but Firebase auth succeeded:', error);
                // Don't throw error - let user continue
            }
        } catch (error) {
            console.warn('Supabase not configured yet, but Firebase auth succeeded:', error);
            // Don't throw error - let user continue
        }
    };

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const { user } = await signInWithPopup(auth, provider);

        // TODO: Create user profile in Supabase when configured
        console.log('Google login successful:', user.uid);

        // Check if user exists in Supabase, if not create them (temporarily disabled)
        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.uid)
                .single();

            if (!existingUser) {
                const { error } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: user.uid,
                            email: user.email,
                            display_name: user.displayName,
                            is_admin: false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ]);

                if (error) {
                    console.warn('Supabase not configured yet, but Google auth succeeded:', error);
                    // Don't throw error - let user continue
                }
            }
        } catch (error) {
            console.warn('Supabase not configured yet, but Google auth succeeded:', error);
            // Don't throw error - let user continue
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
    };

    const fetchUserProfile = async (uid: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', uid)
                .single();

            if (error) {
                console.warn('Supabase not configured yet, using default profile:', error);
                // Return a default profile so the app doesn't break
                return {
                    id: uid,
                    email: '',
                    display_name: '',
                    is_admin: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
            }

            return data;
        } catch (error) {
            console.warn('Supabase not configured yet, using default profile:', error);
            // Return a default profile so the app doesn't break
            return {
                id: uid,
                email: '',
                display_name: '',
                is_admin: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                const profile = await fetchUserProfile(user.uid);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        isAdmin: userProfile?.is_admin || false
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
