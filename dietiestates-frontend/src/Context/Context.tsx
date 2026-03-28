// context/UserContext.tsx
"use client";

import { createContext, useState, ReactNode, useContext, useEffect, useMemo, useCallback } from "react";
import { AuthUser } from "@/Models/AuthUser";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserContextData {
  authuser: AuthUser | null;
  setAuthUser: (Authuser: AuthUser | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextData | undefined>(undefined);

export function UserProvider({ children }: { readonly children: ReactNode }) {
  const [authuser, setAuthUser] = useState<AuthUser | null>(null);

  // Rehydrate user from token on mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token || !API_URL) return;
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AuthUser | null) => { if (data) setAuthUser(data); })
      .catch(() => {});
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    if (typeof globalThis.window !== "undefined") {
      sessionStorage.removeItem('token');
    }
  }, []);

  const contextValue = useMemo(() => ({ authuser, setAuthUser, logout }), [authuser, logout]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser deve essere usato dentro UserProvider");
  return ctx;
};

