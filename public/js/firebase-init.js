// public/js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8LN1CJMMEj6DeI59CnI5H8LbZm0cj_Gg",
  authDomain: "evaliamx.firebaseapp.com",
  projectId: "evaliamx",
  storageBucket: "evaliamx.firebasestorage.app",
  messagingSenderId: "1045898912466",
  appId: "1:1045898912466:web:9ca65e3f2a3a8631c4430b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };