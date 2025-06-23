// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCoeMD-5p2YuNKHdPWp8H_92dV7gGgM-AA",
  authDomain: "store-receipt-app.firebaseapp.com",
  projectId: "store-receipt-app",
  storageBucket: "store-receipt-app.firebasestorage.app",
  messagingSenderId: "950965677328",
  appId: "1:950965677328:web:fe564af0cbe47b8d030995",
  measurementId: "G-QXPY0S92QP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };