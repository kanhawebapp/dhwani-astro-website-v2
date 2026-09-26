"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [showLogin, setShowLogin] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("AuthContext localStorage error:", err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const value = {
    user,
    setUser,
    isLoggedIn: !!user,
    authLoading,
    showLogin,
    setShowLogin,
    pendingRoute,
    setPendingRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}