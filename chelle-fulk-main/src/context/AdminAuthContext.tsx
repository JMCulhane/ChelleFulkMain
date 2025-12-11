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
        return null;
      }
      const parsed = JSON.parse(stored);
      // Check if token is expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const setCredentials = (creds: AdminCredentials | null) => {
    setCredentialsState(creds);
    if (creds) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Check token expiration periodically
  useEffect(() => {
    if (!credentials?.expiresAt) return;

    const checkExpiration = () => {
      if (credentials.expiresAt && Date.now() > credentials.expiresAt) {
        setCredentials(null);
      }
    };

    // Check every second
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
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
