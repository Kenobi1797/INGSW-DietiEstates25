import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as OffertaDAO from '../dao/OffertaDAO';
import { z } from 'zod';

// Creazione nuova offerta (cliente)
export async function createOfferta(req: AuthRequest, res: Response) {
  const parsed = z.object({
    idImmobile: z.number().int(),
    prezzoOfferto: z.number().positive(),
    offertaOriginaleId: z.number().int().optional()
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const offerta = await OffertaDAO.createOfferta(
      parsed.data.idImmobile,
      req.user.id,
      parsed.data.prezzoOfferto,
      parsed.data.offertaOriginaleId
    );
    res.status(201).json(offerta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'offerta' });
  }
}

// Creazione offerta manuale (agente/admin)
export async function createManualOfferta(req: AuthRequest, res: Response) {
  const parsed = z.object({
    idImmobile: z.number().int(),
    idCliente: z.number().int(),
    prezzoOfferto: z.number().positive(),
    offertaOriginaleId: z.number().int().optional()
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const offerta = await OffertaDAO.createManualOfferta(
      parsed.data.idImmobile,
      parsed.data.idCliente,
      parsed.data.prezzoOfferto,
      parsed.data.offertaOriginaleId
    );
    res.status(201).json(offerta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'offerta manuale' });
  }
}

// Recupero storico offerte per immobile
export async function getOffertePerImmobile(req: AuthRequest, res: Response) {
  try {
    const idImmobile = Number(req.params.idImmobile);
    if (!Number.isInteger(idImmobile) || idImmobile <= 0) {
      return res.status(400).json({ error: 'Id immobile non valido' });
    }
    const offerte = await OffertaDAO.getOffertePerImmobile(idImmobile);
    res.json(offerte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle offerte' });
  }
}

// Recupero storico offerte per utente
export async function getOffertePerUtente(req: AuthRequest, res: Response) {
  try {
    const offerte = await OffertaDAO.getOffertePerUtente(req.user.id);
    res.json(offerte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle offerte dell\'utente' });
  }
}

// Ritiro offerta (solo il cliente proprietario)
export async function ritiraOfferta(req: AuthRequest, res: Response) {
  try {
    const idOfferta = Number(req.params.idOfferta);
    if (!Number.isInteger(idOfferta) || idOfferta <= 0)
      return res.status(400).json({ error: 'Id offerta non valido' });

    const offerta = await OffertaDAO.getOffertaById(idOfferta);
    if (!offerta)
      return res.status(404).json({ error: 'Offerta non trovata' });

    if (offerta.idUtente !== req.user.id)
      return res.status(403).json({ error: 'Non autorizzato' });

    if (offerta.stato !== 'InAttesa')
      return res.status(400).json({ error: `Non puoi ritirare un'offerta in stato "${offerta.stato}"` });

    const aggiornata = await OffertaDAO.updateStatoOfferta(idOfferta, 'Ritirata');
    res.json(aggiornata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante il ritiro dell'offerta" });
  }
}

// Aggiornamento stato offerta (agente/admin)
export async function updateOfferta(req: AuthRequest, res: Response) {
  const parsed = z.object({
    nuovoStato: z.enum(['Accettata', 'Rifiutata', 'Controproposta']),
    prezzoControproposta: z.number().positive().optional()
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const idOfferta = Number(req.params.idOfferta);
    if (!Number.isInteger(idOfferta) || idOfferta <= 0) {
      return res.status(400).json({ error: 'Id offerta non valido' });
    }
    const offerta = await OffertaDAO.getOffertaById(idOfferta);
    if (!offerta) return res.status(404).json({ error: 'Offerta non trovata' });

    if (parsed.data.nuovoStato === 'Controproposta') {
      if (!parsed.data.prezzoControproposta) {
        return res.status(400).json({ error: 'Prezzo della controproposta obbligatorio' });
      }
      const nuovaOfferta = await OffertaDAO.createOfferta(
        offerta.idImmobile,
        offerta.idUtente,
        parsed.data.prezzoControproposta,
        offerta.idOfferta
      );
      return res.status(201).json(nuovaOfferta);
    }

    const offertaAggiornata = await OffertaDAO.updateStatoOfferta(idOfferta, parsed.data.nuovoStato);
    res.json(offertaAggiornata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'offerta' });
  }
}

// Offerte per agente (tutte le offerte sugli immobili dell'agente)
export async function getOffertePerAgente(req: AuthRequest, res: Response) {
  try {
    const offerte = await OffertaDAO.getOffertePerAgente(req.user.id);
    res.json(offerte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle offerte' });
  }
}
