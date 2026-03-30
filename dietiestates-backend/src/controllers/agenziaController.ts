import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as AgenzieDAO from '../dao/AgenziaDAO';
import * as UtenteDAO from '../dao/UtenteDAO';
import { z } from 'zod';

export async function createAgenzia(req: AuthRequest, res: Response) {
  const parsed = z.object({
    nome: z.string().min(1),
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  // L'amministratore autenticato diventa automaticamente titolare dell'agenzia
  const idAmministratore = req.user.id;

  try {
    const adminExists = await AgenzieDAO.checkAdminExists(idAmministratore);
    if (!adminExists) return res.status(400).json({ error: 'Amministratore non trovato' });

    const agenzia = await AgenzieDAO.createAgenziaDB({ nome: parsed.data.nome, idAmministratore });
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

export async function getAssignableStaff(_req: AuthRequest, res: Response) {
  try {
    const utenti = await UtenteDAO.getStaffUsers();
    res.json(utenti);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero dello staff assegnabile' });
  }
}

export async function assignStaffToAgenzia(req: AuthRequest, res: Response) {
  const parsed = z.object({
    idUtente: z.number().int().positive(),
    idAgenzia: z.number().int().positive(),
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const utente = await UtenteDAO.getUtenteById(parsed.data.idUtente);
    if (!utente || !['Agente', 'Supporto'].includes(utente.ruolo)) {
      return res.status(404).json({ error: 'Utente assegnabile non trovato' });
    }

    const agenzia = await AgenzieDAO.getAgenziaById(parsed.data.idAgenzia);
    if (!agenzia) {
      return res.status(404).json({ error: 'Agenzia non trovata' });
    }

    const utenteAggiornato = await UtenteDAO.assignUserToAgency(parsed.data.idUtente, parsed.data.idAgenzia);
    if (!utenteAggiornato) {
      return res.status(400).json({ error: 'Impossibile assegnare l\'utente all\'agenzia' });
    }

    res.json(utenteAggiornato);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'assegnazione dell\'utente all\'agenzia' });
  }
}


