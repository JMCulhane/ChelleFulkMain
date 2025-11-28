import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AdminCredentials {
  token?: string;
  username?: string;
  role?: string;
  expiresAt?: number; // Timestamp in milliseconds
  // Add other fields as needed
}

interface AdminAuthContextType {
  credentials: AdminCredentials | null;
  setCredentials: (creds: AdminCredentials | null) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'adminCredentials';

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [credentials, setCredentialsState] = useState<AdminCredentials | null>(() => {
    // Initialize from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('[AdminAuth] No credentials in localStorage. Not logged in.');
        return null;
      }
      const parsed = JSON.parse(stored);
      // Check if token is expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[AdminAuth] Token was expired on load, cleared from storage');
        return null;
      }
      console.log('[AdminAuth] Loaded credentials from localStorage:', parsed);
      return parsed;
    } catch (e) {
      console.log('[AdminAuth] Failed to parse credentials from localStorage:', e);
      return null;
    }
  });

  const setCredentials = (creds: AdminCredentials | null) => {
    setCredentialsState(creds);
    if (creds) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
      console.log('[AdminAuth] Credentials set. Now logged in:', creds);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[AdminAuth] Credentials cleared. Now logged out.');
    }
    console.log('[AdminAuth] localStorage after setCredentials:', localStorage.getItem(STORAGE_KEY));
  };

  // Check token expiration periodically
  useEffect(() => {
    if (!credentials?.expiresAt) return;

    const checkExpiration = () => {
      if (credentials.expiresAt && Date.now() > credentials.expiresAt) {
        console.log('[AdminAuth] Token expired, auto-logging out...');
        setCredentials(null);
      }
    };

    // Check every second
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [credentials]);

  // Log credentials on every change
  useEffect(() => {
    console.log('[AdminAuth] Credentials changed:', credentials);
    console.log('[AdminAuth] localStorage:', localStorage.getItem(STORAGE_KEY));
  }, [credentials]);

  return (
    <AdminAuthContext.Provider value={{ credentials, setCredentials }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
