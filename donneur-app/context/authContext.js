import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase"; // Firebase instance

import { BACKEND_URL } from "../constants/backend";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [donneurID, setDonneurID] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const jwt_token = await user.getIdToken(true);
          setToken(jwt_token);
          
          let url = `${BACKEND_URL}/authenticate`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${jwt_token}`, 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning' : 'vag'
            }
          });
          const data      = await response.json();
          setRole(data.role);
          setDonneurID(data.id);
          setUserData(data.data);
          
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
    <AuthContext.Provider value={{ user, role, loading, donneurID, token, userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
