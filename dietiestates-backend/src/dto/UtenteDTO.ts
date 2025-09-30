export interface UtenteDTO {
  idUtente: number;
  nome: string;
  cognome: string;
  email: string;
  passwordHash?: string;
  ruolo: "AmministratoreAgenzia" | "Supporto" | "Agente" | "Cliente";
  dataCreazione: Date;
  idAgenzia?: number | null;
}
