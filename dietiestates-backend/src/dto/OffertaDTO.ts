import { z } from "zod";

export const OffertaSchema = z.object({
  idOfferta: z.number().int().optional(), 
  idImmobile: z.number().int(),
  idUtente: z.number().int(),
  prezzoOfferto: z.number().positive(),
  stato: z.enum(["InAttesa", "Accettata", "Rifiutata", "Controproposta", "Ritirata"]).optional(), 
  dataOfferta: z.date().optional(), 
  offertaManuale: z.boolean().optional(), 
  idOffertaOriginale: z.number().int().nullable().optional(),
  titolo: z.string().optional(), // Titolo dell'immobile
  indirizzo: z.string().optional(), // Indirizzo dell'immobile
});

export type OffertaDTO = z.infer<typeof OffertaSchema>;
