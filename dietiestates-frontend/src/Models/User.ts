
import { UserRole } from "@/Types/Ruoli";

export interface User {
  idUtente: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
  dataCreazione: string;
}
