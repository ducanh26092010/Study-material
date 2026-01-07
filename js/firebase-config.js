// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7NYapAAPMflFi_m-5GIzRBKOvGYllWnE",
  authDomain: "ducanhproject-61cfa.firebaseapp.com",
  projectId: "ducanhproject-61cfa",
  storageBucket: "ducanhproject-61cfa.firebasestorage.app",
  messagingSenderId: "231553204300",
  appId: "1:231553204300:web:23ce67906a3010de9974e9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);