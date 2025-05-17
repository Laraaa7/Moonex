
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

    const firebaseConfig = {
        apiKey: "AIzaSyAr_Tj7P5D3m7wynGh9qsNj-T-XaeYevEc",
        authDomain: "moonex-6610f.firebaseapp.com",
        projectId: "moonex-6610f",
        storageBucket: "moonex-6610f.firebasestorage.app",
        messagingSenderId: "233164133802",
        appId: "1:233164133802:web:51428731cef8a2371447d3",
        measurementId: "G-06XJXWVB3P"
      };
  
// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// AÑADIR ESTOS SCOPE PARA FORZARLO
provider.addScope('email');
provider.addScope('profile');

// Exporta lo que necesites
export { auth, provider };