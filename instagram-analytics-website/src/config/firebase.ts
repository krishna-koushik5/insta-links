import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOLa2KxpJ9ZXJtzs7qm1Xygtc8FNQLtDM",
    authDomain: "insta-analytics-45e5e.firebaseapp.com",
    projectId: "insta-analytics-45e5e",
    storageBucket: "insta-analytics-45e5e.firebasestorage.app",
    messagingSenderId: "271905347675",
    appId: "1:271905347675:web:18f13f4a0ccff416aa077e",
    measurementId: "G-C1JED8T9ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
