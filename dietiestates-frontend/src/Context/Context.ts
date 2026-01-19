// context/UserContext.tsx

import { createContext } from "react";
import { UserRole } from "@/Types/Ruoli";
import { AuthUser } from "@/Models/AuthUser";

export interface UserContextData {
  Authuser: AuthUser | null;
  setAuthUser: (Authuser: AuthUser | null) => void;

  activeRole: UserRole | null;
  setActiveRole: (role: UserRole | null) => void;
}

export const UserContext = createContext<UserContextData>({
  Authuser: null,
  setAuthUser: () => {},
  activeRole: null,
  setActiveRole: () => {},
});
