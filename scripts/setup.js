#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Instagram Showcase Setup Script');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from env.example');
    } else {
        console.log('❌ env.example file not found');
    }
} else {
    console.log('✅ .env file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Update your .env file with your Firebase and Supabase credentials');
console.log('2. Set up your Firebase project:');
console.log('   - Enable Authentication with Email/Password and Google providers');
console.log('   - Get your Firebase config from Project Settings > General');
console.log('3. Set up your Supabase project:');
console.log('   - Create a new project at https://supabase.com');
console.log('   - Get your project URL and anon key from Settings > API');
console.log('   - Run the SQL schema from database/schema.sql in the SQL editor');
console.log('4. Run "npm start" to start the development server');
console.log('5. Create an admin user by setting is_admin=true in the users table');

console.log('\n🔗 Useful Links:');
console.log('- Firebase Console: https://console.firebase.google.com/');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Documentation: README.md');

console.log('\n✨ Setup complete! Happy coding!');
