import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mfeihxdfpyfcsnjnawo.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWloeGRmcHlmY3NubmphbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTEwNjcsImV4cCI6MjA3MjYyNzA2N30.jWsGtseG02jBujHussVFQHCggFnkNgkkJgtnYBbXHSw';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface InstagramLink {
    id: string;
    user_id: string;
    url: string;
    title?: string;
    description?: string;
    date_uploaded: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    display_name?: string;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}
