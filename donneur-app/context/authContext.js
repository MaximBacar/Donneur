import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase"; // Firebase instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [donneurID, setDonneurID] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          let url = `https://api.donneur.ca/get_user?uid=${user.uid}`;
          const jwt_token = await user.getIdToken(true);
          const response  = await fetch(url);
          const data      = await response.json();
          setRole(data.role);
          setDonneurID(data.db_id);
          setToken(jwt_token);
        } catch (error) {
          console.error("Failed to fetch role:", error);
        }
      } else {
        setRole(null);
      }
      // setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, donneurID, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
