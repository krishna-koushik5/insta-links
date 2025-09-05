# Instagram Showcase Platform

A modern web application that allows users to log in via Firebase Authentication, upload Instagram links showcasing their works, and store these links in Supabase. Regular users can only access their own Instagram links, while admins can access all user data and analytics.

## Features

- 🔐 **Firebase Authentication** - Secure user login with email/password and Google OAuth
- 📱 **Instagram Link Management** - Upload, edit, and delete Instagram showcase links
- 👥 **User Dashboard** - Personal dashboard for managing your Instagram links
- 🛡️ **Admin Dashboard** - Comprehensive analytics and user management for admins
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔒 **Role-based Access Control** - Secure separation between regular users and admins
- 📊 **Real-time Analytics** - Live insights into user activity and content

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Authentication**: Firebase Authentication
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- A Firebase project
- A Supabase project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd instagram-showcase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication and add Email/Password and Google providers
4. Go to Project Settings > General > Your apps
5. Add a web app and copy the configuration

### 4. Supabase Setup

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema from `database/schema.sql` in the Supabase SQL editor

### 5. Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Update `.env` with your actual configuration:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-firebase-app-id

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 6. Database Setup

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL to create the necessary tables and policies

### 7. Create Admin User

After setting up the database, you need to create an admin user:

1. Sign up for a regular account through the app
2. Go to your Supabase dashboard > Table Editor > users
3. Find your user record and set `is_admin` to `true`

## Running the Application

### Development Mode

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   ├── dashboard/
│   │   ├── UserDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── LandingPage.tsx
│   ├── Navigation.tsx
│   └── ProtectedRoute.tsx
├── config/
│   ├── firebase.ts
│   └── supabase.ts
├── contexts/
│   └── AuthContext.tsx
├── App.tsx
└── index.tsx
```

## Key Features Explained

### Authentication Flow
- Users can sign up/login with email/password or Google OAuth
- Firebase handles authentication and provides JWT tokens
- User profiles are stored in Supabase with Firebase UID as the primary key

### Instagram Link Management
- Users can upload Instagram post URLs with titles and descriptions
- URLs are validated to ensure they're valid Instagram links
- Users can edit and delete their own links
- Links are stored with user association for privacy

### Admin Dashboard
- Admins can view all users and their Instagram links
- Comprehensive analytics including total users, links, and activity
- Ability to promote/demote users to admin status
- Delete any user's Instagram links

### Security Features
- Row Level Security (RLS) in Supabase ensures data privacy
- Users can only access their own data
- Admins have elevated permissions through role-based access control
- All API calls are authenticated through Firebase

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init hosting
```

4. Build and deploy:
```bash
npm run build
firebase deploy
```

### Other Hosting Options

The built app can be deployed to any static hosting service like:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## Roadmap

- [ ] Instagram API integration for automatic metadata fetching
- [ ] Advanced analytics and reporting
- [ ] Bulk upload functionality
- [ ] Link categorization and tagging
- [ ] Export functionality for user data
- [ ] Mobile app development
