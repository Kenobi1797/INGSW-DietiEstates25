// context/UserContext.tsx
"use client";

import { createContext  ,useState, ReactNode, useContext} from "react";
import { AuthUser } from "@/Models/AuthUser";

export interface UserContextData {
  authuser: AuthUser | null;
  setAuthUser: (Authuser: AuthUser | null) => void;
  logout: () => void;

}

const UserContext = createContext<UserContextData | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [authuser, setAuthUser] = useState<AuthUser | null>(null);

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

