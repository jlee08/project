// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCpJKkLrOwQiD-XgOXY8GXimPIhKJEYAbQ',
  authDomain: 'cosmotree-app.firebaseapp.com',
  projectId: 'cosmotree-app',
  storageBucket: 'cosmotree-app.firebasestorage.app',
  messagingSenderId: '966941239104',
  appId: '1:966941239104:web:c48d39401f7945ec18fca5',
  measurementId: 'G-NL3B86NZ0N',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
