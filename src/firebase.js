// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// ✅ Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyB2msMShIZ7WWwTNYR5JjOI6ux8BJWOFFU",
  authDomain: "script-genai-bot.firebaseapp.com",
  projectId: "script-genai-bot",
  storageBucket: "script-genai-bot.firebasestorage.app",
  messagingSenderId: "358648216793",
  appId: "1:358648216793:web:16c78983495eaba3c112c8",
  measurementId: "G-FV3ZRVMK84"
};


// const firebaseConfig = {
//   apiKey: "AIzaSyB2msMShIZ7WWwTNYR5JjOI6ux8BJWOFFU",
//   authDomain: "script-genai-bot.firebaseapp.com",
//   projectId: "script-genai-bot",
//   storageBucket: "script-genai-bot.firebasestorage.app",
//   messagingSenderId: "358648216793",
//   appId: "1:358648216793:web:847c73aa947e000bc112c8",
//   measurementId: "G-DZ0LRWEZ6Y"
// };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider, analytics };




// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyA01mK78K5rgL2grIPXF10em0NtQWOy0c8",
//   authDomain: "script-frontend.firebaseapp.com",
//   projectId: "script-frontend",
//   storageBucket: "script-frontend.firebasestorage.app",
//   messagingSenderId: "347244986469",
//   appId: "1:347244986469:web:f77f19f8c833046c5f468c",
//   measurementId: "G-8TB5H401TS"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);