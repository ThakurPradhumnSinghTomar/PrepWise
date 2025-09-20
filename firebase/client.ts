// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWd91VElB6V1MVcExkSOT5VxJPo_RfrNo",
  authDomain: "prepwise-3abf5.firebaseapp.com",
  projectId: "prepwise-3abf5",
  storageBucket: "prepwise-3abf5.firebasestorage.app",
  messagingSenderId: "816661989943",
  appId: "1:816661989943:web:be734a877ef322cc754db2",
  measurementId: "G-6NKCXJSDZE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db  = getFirestore(app);