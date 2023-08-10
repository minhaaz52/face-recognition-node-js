// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhotYhYbtGcLg1eErRiROrOFT7ERT8mmY",
  authDomain: "proctoring-system-81329.firebaseapp.com",
  projectId: "proctoring-system-81329",
  storageBucket: "proctoring-system-81329.appspot.com",
  messagingSenderId: "255381384119",
  appId: "1:255381384119:web:0c15330c93967220abd632"
};

const app=initializeApp(firebaseConfig)
const db=getFirestore(app)
const messaging = getMessaging(app);

// connectFirestoreEmulator(db, "localhost", 8080);

export {app, db, messaging}
