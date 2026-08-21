// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDs2Z0FhDcRDSep6cklRLgLU1mhTwOtZGg",
  authDomain: "planningworkspace.firebaseapp.com",
  databaseURL: "https://planningworkspace-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "planningworkspace",
  storageBucket: "planningworkspace.firebasestorage.app",
  messagingSenderId: "988660586447",
  appId: "1:988660586447:web:baa2c121f4f719fd69a4ba",
  measurementId: "G-ES62YWDG33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { app, analytics, database };