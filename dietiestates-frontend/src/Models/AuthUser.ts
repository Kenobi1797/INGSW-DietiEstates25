
import { UserRole } from "@/Types/Ruoli";

export interface AuthUser {
  idUtente: number;
  nome: string;
  ruolo: UserRole;
  idAgenzia?: number;
  isOAuth?: boolean;
  loginMethod?: 'Google' | 'Email e password';
  loginSourceTable?: 'OAuthAccount' | 'Utente';
}
