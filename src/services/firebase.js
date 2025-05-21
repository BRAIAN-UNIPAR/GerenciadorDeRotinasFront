// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHiHNjuFWTbpsVVP1FMwEymdK6WEmGsN4",
  authDomain: "cleitonunipar.firebaseapp.com",
  projectId: "cleitonunipar",
  storageBucket: "cleitonunipar.firebasestorage.app",
  messagingSenderId: "782673463167",
  appId: "1:782673463167:web:6d35e611457cc07cb5bc4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)