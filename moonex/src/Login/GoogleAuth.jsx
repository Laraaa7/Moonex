import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../api/firebase.config";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Logs out the user by removing the local storage token and user data
   * and by calling the signOut function from the Firebase auth SDK
   * @returns {Promise<void>} The promise returned from the signOut function
   */
/*******  7b0c0ae0-d3db-4c32-afcd-15182275299d  *******/    try {
      const result = await signInWithPopup(auth, provider);
      return result.user; // Devuelve el usuario de Firebase
    } catch (error) {
      console.error("Error en signInWithPopup:", error);
      return null;
    }
  };

  const logOut = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setFirebaseUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ googleSignIn, logOut, firebaseUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);