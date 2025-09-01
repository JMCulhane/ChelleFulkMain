import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AdminCredentials {
  token?: string;
  username?: string;
  role?: string;
  // Add other fields as needed
}

interface AdminAuthContextType {
  credentials: AdminCredentials | null;
  setCredentials: (creds: AdminCredentials | null) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
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
