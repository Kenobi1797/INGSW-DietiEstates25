import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as OffertaDAO from '../dao/OffertaDAO';
import * as UtenteDAO from '../dao/UtenteDAO';
import pool from '../config/db';
import { z } from 'zod';

async function handleControproposta(
  idOfferta: number,
  prezzoControproposta: number | undefined,
  offerta: NonNullable<Awaited<ReturnType<typeof OffertaDAO.getOffertaById>>>,
  res: Response
) {
  if (!prezzoControproposta) {
    return res.status(400).json({ error: 'Prezzo della controproposta obbligatorio' });
  }

  await OffertaDAO.updateStatoOfferta(idOfferta, 'Controproposta');
  const nuovaOfferta = await OffertaDAO.createOfferta(
    offerta.idImmobile,
    offerta.idUtente,
    prezzoControproposta,
    offerta.idOfferta
  );
  return res.status(201).json(nuovaOfferta);
}

async function handleAccettazione(
  idOfferta: number,
  offerta: NonNullable<Awaited<ReturnType<typeof OffertaDAO.getOffertaById>>>,
  res: Response
) {
  const immobileInVendita = await OffertaDAO.isImmobileInVendita(offerta.idImmobile);
  if (immobileInVendita) {
    const esisteGiaAccettata = await OffertaDAO.hasAcceptedOffertaForImmobile(offerta.idImmobile, idOfferta);
    if (esisteGiaAccettata) {
      return res.status(409).json({ error: 'Esiste gia una offerta accettata per questo immobile in vendita' });
    }
  }

  const offertaAggiornata = await OffertaDAO.updateStatoOfferta(idOfferta, 'Accettata');

  if (immobileInVendita) {
    await OffertaDAO.markImmobileAsVenduto(offerta.idImmobile);
    await OffertaDAO.rejectPendingOfferteForImmobile(offerta.idImmobile, idOfferta);
  }

  return res.json(offertaAggiornata);
}

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
    idCliente: z.number().int().optional(),
    prezzoOfferto: z.number().positive(),
    offertaOriginaleId: z.number().int().optional()
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const idCliente = parsed.data.idCliente ?? await UtenteDAO.getOrCreateManualCliente();

    const offerta = await OffertaDAO.createManualOfferta(
      parsed.data.idImmobile,
      idCliente,
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

// Storico offerte unificato — dispatch per ruolo
export async function getStoricoOfferte(req: AuthRequest, res: Response) {
  try {
    let offerte;
    switch (req.user.ruolo) {
      case 'Cliente':
        offerte = await OffertaDAO.getOffertePerUtente(req.user.id);
        break;
      case 'Agente':
      case 'AmministratoreAgenzia':
        offerte = await OffertaDAO.getOffertePerAgente(req.user.id);
        break;
      case 'Supporto':
        offerte = await OffertaDAO.getAllOfferte();
        break;
      default:
        return res.status(403).json({ error: 'Accesso non autorizzato' });
    }
    res.json(offerte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dello storico offerte' });
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

    if (offerta.stato !== 'InAttesa') {
      return res.status(400).json({ error: `Offerta non modificabile nello stato "${offerta.stato}"` });
    }

    if (parsed.data.nuovoStato === 'Controproposta') {
      return handleControproposta(idOfferta, parsed.data.prezzoControproposta, offerta, res);
    }

    if (parsed.data.nuovoStato === 'Accettata') {
      return handleAccettazione(idOfferta, offerta, res);
    }

    const offertaAggiornata = await OffertaDAO.updateStatoOfferta(idOfferta, parsed.data.nuovoStato);
    res.json(offertaAggiornata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'offerta' });
  }
}

// Controfferte ricevute dal cliente (offerte con idOffertaOriginale != null)
export async function getControffertePerCliente(req: AuthRequest, res: Response) {
  try {
    const offerte = await OffertaDAO.getControffertePerCliente(req.user.id);
    res.json(offerte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle controfferte' });
  }
}

// Cliente risponde a una controfferta (Accettata / Rifiutata)
export async function rispondiControproposta(req: AuthRequest, res: Response) {
  const parsed = z.object({
    risposta: z.enum(['Accettata', 'Rifiutata'])
  }).safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const idOfferta = Number(req.params.idOfferta);
    if (!Number.isInteger(idOfferta) || idOfferta <= 0)
      return res.status(400).json({ error: 'Id offerta non valido' });

    const offerta = await OffertaDAO.getOffertaById(idOfferta);
    if (!offerta) return res.status(404).json({ error: 'Offerta non trovata' });

    if (offerta.idUtente !== req.user.id)
      return res.status(403).json({ error: 'Non autorizzato' });

    if (!offerta.idOffertaOriginale)
      return res.status(400).json({ error: 'Non è una controfferta' });

    if (offerta.stato !== 'InAttesa')
      return res.status(400).json({ error: `Non puoi rispondere a una controfferta in stato "${offerta.stato}"` });

    const aggiornata = await OffertaDAO.updateStatoOfferta(idOfferta, parsed.data.risposta);
    res.json(aggiornata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la risposta alla controfferta' });
  }
}

// Offerte per agente (tutte le offerte sugli immobili dell'agente)
// Per AmministratoreAgenzia restituisce tutte le offerte degli agenti della sua agenzia
export async function getOffertePerAgente(req: AuthRequest, res: Response) {
  try {
    if (req.user.ruolo === 'AmministratoreAgenzia') {
      const { rows } = await pool.query(
        'SELECT IdAgenzia FROM Utente WHERE IdUtente = $1',
        [req.user.id]
      );
      const idAgenzia = rows[0]?.idagenzia;
      if (!idAgenzia) return res.json([]);
      const offerte = await OffertaDAO.getOffertePerAgenzia(idAgenzia);
      return res.json(offerte);
    }
    const offerte = await OffertaDAO.getOffertePerAgente(req.user.id);
    res.json(offerte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle offerte' });
  }
}
