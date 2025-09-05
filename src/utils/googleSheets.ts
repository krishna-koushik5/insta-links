interface InstagramPost {
    user_id: string;
    url: string;
    title: string;
    description: string;
    likes: number;
    views: number;
    comments: number;
    date_uploaded: string;
}

class GoogleSheetsService {
    private spreadsheetId: string;
    private apiKey: string;

    constructor() {
        this.spreadsheetId = process.env.REACT_APP_GOOGLE_SHEETS_ID || '';
        this.apiKey = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || '';
    }

    async fetchMetrics(): Promise<InstagramPost[]> {
        try {
            console.log('Fetching data from Google Sheets...');
            console.log('Sheet ID:', this.spreadsheetId);
            console.log('API Key:', this.apiKey ? 'Present' : 'Missing');
            console.log('Environment check - REACT_APP_GOOGLE_SHEETS_ID:', process.env.REACT_APP_GOOGLE_SHEETS_ID);
            console.log('Environment check - REACT_APP_GOOGLE_SHEETS_API_KEY:', process.env.REACT_APP_GOOGLE_SHEETS_API_KEY ? 'Present' : 'Missing');

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/USER1!A:E?key=${this.apiKey}`;

            console.log('Making request to URL:', url);
            const response = await fetch(url);

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const data = await response.json();
            console.log('Raw response data:', data);
            const rows = data.values;

            if (!rows || rows.length <= 1) {
                console.log('No data found in Google Sheets');
                return [];
            }

            // Skip header row and convert to InstagramPost objects
            // Your sheet structure: A=USER_ID, B=INSTAGRAM_URL, C=Views, D=Likes, E=comment_count
            const posts: InstagramPost[] = rows.slice(1).map((row: any[]) => ({
                user_id: row[0] || '', // USER_ID (email address)
                url: row[1] || '', // INSTAGRAM_URL
                title: '', // No title in your sheet
                description: '', // No description in your sheet
                likes: parseInt(row[3]) || 0, // Column D = Likes
                views: parseInt(row[2]) || 0, // Column C = Views
                comments: parseInt(row[4]) || 0, // Column E = comment_count
                date_uploaded: new Date().toISOString() // No date in your sheet, use current time
            }));

            console.log('Fetched posts from Google Sheets:', posts);
            return posts;
        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
            return [];
        }
    }

    async addPost(post: InstagramPost): Promise<boolean> {
        try {
            console.log('Adding post to Google Sheets:', post);

            const values = [
                [
                    post.user_id, // USER_ID (email)
                    post.url, // INSTAGRAM_URL
                    post.views, // Views
                    post.likes, // Likes
                    post.comments // comment_count
                ]
            ];

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/USER1!A:E:append?valueInputOption=RAW&key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Successfully added post to Google Sheets');
            return true;
        } catch (error) {
            console.error('Error adding post to Google Sheets:', error);
            return false;
        }
    }

    async updatePost(postId: string, post: Partial<InstagramPost>): Promise<boolean> {
        try {
            // This would require finding the row by post ID and updating it
            // For now, we'll just add a new row
            console.log('Updating post in Google Sheets:', postId, post);
            return await this.addPost(post as InstagramPost);
        } catch (error) {
            console.error('Error updating post in Google Sheets:', error);
            return false;
        }
    }
}

export default function createGoogleSheetsService() {
    return new GoogleSheetsService();
}
