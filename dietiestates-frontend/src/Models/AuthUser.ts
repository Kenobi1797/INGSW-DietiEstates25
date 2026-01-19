
import { UserRole } from "@/Types/Ruoli";

export interface AuthUser {
  idUtente: number;
  nome: string;
  ruolo: UserRole;
}
