import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase"; // Firebase instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          let url = `https://api.donneur.ca/get_role?uid=${user.uid}`;
          console.log(url);
          const response = await fetch(url);
          console.log("hi");
          const data = await response.json();
          setRole(data.role);
        } catch (error) {
          console.error("Failed to fetch role:", error);
        }

        // setRole('receiver');
      } else {
        setRole(null);
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
