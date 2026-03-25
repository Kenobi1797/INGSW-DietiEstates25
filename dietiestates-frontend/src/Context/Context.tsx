// context/UserContext.tsx
"use client";

import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { AuthUser } from "@/Models/AuthUser";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserContextData {
  authuser: AuthUser | null;
  setAuthUser: (Authuser: AuthUser | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextData | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [authuser, setAuthUser] = useState<AuthUser | null>(null);

  // Rehydrate user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !API_URL) return;
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AuthUser | null) => { if (data) setAuthUser(data); })
      .catch(() => {});
  }, []);

  const logout = () => {
    setAuthUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem('token');
    }
  };

  return (
    <UserContext.Provider value={{ authuser, setAuthUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser deve essere usato dentro UserProvider");
  return ctx;
};

