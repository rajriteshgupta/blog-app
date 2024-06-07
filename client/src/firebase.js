// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "blog-app-1f895.firebaseapp.com",
  projectId: "blog-app-1f895",
  storageBucket: "blog-app-1f895.appspot.com",
  messagingSenderId: "307431728627",
  appId: "1:307431728627:web:c4ac08060a38f5dbaa1e86"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);