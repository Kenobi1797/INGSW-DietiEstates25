import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as AgenzieDAO from '../dao/AgenziaDAO';
import { AgenziaSchema } from '../dto/AgenziaDTO';
import { z } from 'zod';

export async function createAgenzia(req: AuthRequest, res: Response) {
  const parsed = z.object({
    nome: z.string().min(1),
    idAmministratore: z.number().int()
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const { nome, idAmministratore } = parsed.data;

  try {
    const adminExists = await AgenzieDAO.checkAdminExists(idAmministratore);
    if (!adminExists) return res.status(400).json({ error: 'Amministratore non trovato' });

    const agenzia = await AgenzieDAO.createAgenziaDB({ nome, idAmministratore });
    res.status(201).json(agenzia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'agenzia' });
  }
}

export async function getAgenzie(req: Request, res: Response) {
  try {
    const agenzie = await AgenzieDAO.getAgenzieDB();
    res.json(agenzie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero delle agenzie' });
  }
}

export async function updateAgenzia(req: AuthRequest, res: Response) {
  const { idAgenzia } = req.params;

  const parsed = AgenziaSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const id = Number(idAgenzia);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Id agenzia non valido' });
    }

    const agenziaEsistente = await AgenzieDAO.getAgenziaById(id);
    if (!agenziaEsistente) return res.status(404).json({ error: 'Agenzia non trovata' });

    const agenziaAggiornata = await AgenzieDAO.updateAgenziaDB(id, parsed.data);
    res.json(agenziaAggiornata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'agenzia' });
  }
}
