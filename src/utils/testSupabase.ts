import { supabase } from '../config/supabase';

export const testSupabaseConnection = async () => {
    try {
        console.log('Testing Supabase connection...');

        // Test basic connection
        const { data, error } = await supabase
            .from('user_links')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }

        console.log('✅ Supabase connection successful!');
        console.log('Data:', data);
        return true;
    } catch (err) {
        console.error('❌ Supabase connection failed:', err);
        return false;
    }
};

// Test authentication
export const testSupabaseAuth = async () => {
    try {
        console.log('Testing Supabase auth...');

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.log('Auth error (expected if not logged in):', error.message);
            return false;
        }

        if (user) {
            console.log('✅ User is authenticated:', user.email);
            return true;
        } else {
            console.log('ℹ️ No user currently authenticated');
            return false;
        }
    } catch (err) {
        console.error('❌ Auth test failed:', err);
        return false;
    }
};
