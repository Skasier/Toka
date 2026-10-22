import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCWyKv-1IVNqKIgy0gmd6f_Zx44xGmwLg",
  authDomain: "addad-59428.firebaseapp.com",
  projectId: "addad-59428",
  storageBucket: "addad-59428.firebasestorage.app",
  messagingSenderId: "533878148668",
  appId: "1:533878148668:web:4fea4b372f636f28a7fd39",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
