import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnstQJcyhNcNxQ0_BdYSjbkiEr6EIqzOk",
  authDomain: "visgo-e4a97.firebaseapp.com",
  projectId: "visgo-e4a97",
  storageBucket: "visgo-e4a97.appspot.com",
  messagingSenderId: "412710176287",
  appId: "1:412710176287:web:7573c6353bc70c853eb72a",
  measurementId: "G-RS98ZCWDKY",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
