import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnEtaXTVFsZBtwY4mbtkMVlFgeYxxEp6o",
  authDomain: "arcadia-1ea2a.firebaseapp.com",
  projectId: "arcadia-1ea2a",
  storageBucket: "arcadia-1ea2a.firebasestorage.app",
  messagingSenderId: "939838520725",
  appId: "1:939838520725:web:ae31b1efca715fbf5e8a9c",
  measurementId: "G-3QPJ8PFKXG"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);