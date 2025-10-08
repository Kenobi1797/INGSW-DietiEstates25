// src/controllers/agenziaController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as AgenzieDAO from '../dao/AgenziaDAO';

// Creazione nuova agenzia (solo admin)
export async function createAgenzia(req: AuthRequest, res: Response) {
  const { nome, idAmministratore } = req.body;

  if (!nome || !idAmministratore) {
    return res.status(400).json({ error: 'Nome e idAmministratore sono obbligatori' });
  }

  try {
    const adminExists = await AgenzieDAO.checkAdminExists(idAmministratore);
    if (!adminExists) return res.status(400).json({ error: 'Amministratore non trovato' });

    const agenzia = await AgenzieDAO.createAgenziaDB(nome, idAmministratore);
    res.status(201).json(agenzia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'agenzia' });
  }
}

// Recupero agenzie (tutti gli utenti loggati possono vedere)
export async function getAgenzie(req: Request, res: Response) {
  try {
    const agenzie = await AgenzieDAO.getAgenzieDB();
    res.json(agenzie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero delle agenzie' });
  }
}

// Aggiornamento agenzia
export async function updateAgenzia(req: AuthRequest, res: Response) {
  const { idAgenzia } = req.params;
  const { nome, attiva } = req.body;

  if (!nome && attiva === undefined) {
    return res.status(400).json({ error: 'Almeno un campo da aggiornare è obbligatorio' });
  }

  try {
    const agenziaEsistente = await AgenzieDAO.getAgenziaById(Number(idAgenzia));
    if (!agenziaEsistente) return res.status(404).json({ error: 'Agenzia non trovata' });

    const fields: string[] = [];
    const values: any[] = [];

    if (nome) { fields.push('Nome'); values.push(nome); }
    if (attiva !== undefined) { fields.push('Attiva'); values.push(attiva); }

    const agenziaAggiornata = await AgenzieDAO.updateAgenziaDB(Number(idAgenzia), fields, values);
    res.json(agenziaAggiornata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'agenzia' });
  }
}
