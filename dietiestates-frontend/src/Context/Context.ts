// context/UserContext.tsx

import { createContext } from "react";
import { UserRole } from "@/Types/Ruoli";
import { User } from "@/Models/User";

export interface UserContextData {
  user: User | null;
  setUser: (user: User | null) => void;

  activeRole: UserRole | null;
  setActiveRole: (role: UserRole | null) => void;
}

export const UserContext = createContext<UserContextData>({
  user: null,
  setUser: () => {},
  activeRole: null,
  setActiveRole: () => {},
});
