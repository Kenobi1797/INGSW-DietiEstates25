import { z } from "zod";

export const AgenziaSchema = z.object({
  idAgenzia: z.number().int().optional(),
  nome: z.string().min(1),
  idAmministratore: z.number().int(),
  attiva: z.boolean(),
});

export type AgenziaDTO = z.infer<typeof AgenziaSchema>;
