import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDf__9_2fdwoDcSU0FPbWGh3Pys5wpasn4",
  authDomain: "thebhubaneswarcrew-49504.firebaseapp.com",
  projectId: "thebhubaneswarcrew-49504",
  storageBucket: "thebhubaneswarcrew-49504.firebasestorage.app",
  messagingSenderId: "344818711351",
  appId: "1:344818711351:web:a89e26499a76441e4bb8b2",
  measurementId: "G-K4D3TPE9SC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ ADD THIS

export { auth, db };