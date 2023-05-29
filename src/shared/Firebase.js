// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAUKHaFviUHK2rYrE7vMzLJl8CG5ZcaiU",
  authDomain: "setab-388009.firebaseapp.com",
  projectId: "setab-388009",
  storageBucket: "setab-388009.appspot.com",
  messagingSenderId: "1001399891070",
  appId: "1:1001399891070:web:af9d984c46e491b4f3942f"
};

// Initialize Firebase
const app = () => initializeApp(firebaseConfig);

export default app;