import { z } from "zod";

export const UtenteSchema = z.object({
  idUtente: z.number().int().optional(), 
  nome: z.string().min(1),
  cognome: z.string().min(1),
  email: z.string(),
  passwordHash: z.string().optional(),
  ruolo: z.enum(["AmministratoreAgenzia", "Supporto", "Agente", "Cliente"]),
  dataCreazione: z.date().optional(),
  idAgenzia: z.number().int().nullable().optional(),
});

export type UtenteDTO = z.infer<typeof UtenteSchema>;
