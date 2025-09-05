import { supabase } from '../config/supabase';

export const addSampleData = async (userId: string) => {
    try {
        // Add sample Instagram links with metrics
        const sampleLinks = [
            {
                user_id: userId,
                url: 'https://instagram.com/p/sample1',
                title: 'Amazing Sunset Photo',
                description: 'Beautiful sunset from my vacation',
                likes: 1250,
                views: 5600,
                comments: 89
            },
            {
                user_id: userId,
                url: 'https://instagram.com/p/sample2',
                title: 'Food Photography',
                description: 'Delicious homemade pasta',
                likes: 890,
                views: 3200,
                comments: 45
            },
            {
                user_id: userId,
                url: 'https://instagram.com/p/sample3',
                title: 'Travel Adventure',
                description: 'Exploring new places',
                likes: 2100,
                views: 8900,
                comments: 156
            },
            {
                user_id: userId,
                url: 'https://instagram.com/p/sample4',
                title: 'Fitness Journey',
                description: 'Workout progress update',
                likes: 750,
                views: 2800,
                comments: 32
            },
            {
                user_id: userId,
                url: 'https://instagram.com/p/sample5',
                title: 'Art Creation',
                description: 'My latest painting',
                likes: 1500,
                views: 4500,
                comments: 78
            }
        ];

        const { data, error } = await supabase
            .from('instagram_links')
            .insert(sampleLinks);

        if (error) {
            console.error('Error adding sample data:', error);
            return false;
        }

        console.log('Sample data added successfully:', data);
        return true;
    } catch (error) {
        console.error('Error adding sample data:', error);
        return false;
    }
};
