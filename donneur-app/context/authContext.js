import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase"; // Firebase instance

import { authenticate } from "../components/api.donneur.ca/authentication";
import { router } from "expo-router";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [ user,      setUser      ] = useState(null);
  const [ role,      setRole      ] = useState(null);
  const [ token,     setToken     ] = useState(null);
  const [ loading,   setLoading   ] = useState(true);
  const [ userData,  setUserData  ] = useState(null);
  const [ donneurID, setDonneurID ] = useState(null);
  
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setUser(user);
          let token = await user.getIdToken()
          const data = await authenticate(token);
          
          setToken(token);
          setRole(data.role);
          setDonneurID(data.id);
          setUserData(data.data);

        } catch (error) {
          console.error("Failed to fetch user:", {
            message: error.message,
            name: error.response,
            stack: error.request,
            error, // Logs the full error object for additional context
          });
        }
      }
      else{
        router.replace('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, role, loading, donneurID, token, userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
