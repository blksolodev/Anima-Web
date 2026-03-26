import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD3AfpIUBecITwRhvLIMOXE2YR4EkooB2c",
  authDomain: "anima-social-app.firebaseapp.com",
  projectId: "anima-social-app",
  storageBucket: "anima-social-app.firebasestorage.app",
  messagingSenderId: "189325489480",
  appId: "1:189325489480:web:9e9328850ef05407976f7d",
  measurementId: "G-CZZEQWH3ZR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
