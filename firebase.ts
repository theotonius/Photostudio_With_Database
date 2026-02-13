
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
 apiKey: "AIzaSyA8mBN7hpye7Tn1bufCdNW1kCOhr1X5m0g",
 authDomain: "photo-studio-6d76d.firebaseapp.com",
 projectId: "photo-studio-6d76d",
 storageBucket: "photo-studio-6d76d.firebasestorage.app",
 messagingSenderId: "467396022282",
 appId: "1:467396022282:web:9939d96d4bcda9e43d4ff3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, orderBy };
export default db;
