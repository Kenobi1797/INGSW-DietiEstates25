import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';
import * as OffertaDAO from '../dao/OffertaDAO';

// Creazione nuova offerta
export async function createOfferta(req: AuthRequest, res: Response) {
  const { idImmobile, prezzoOfferto, offertaOriginaleId } = req.body;
  if (!idImmobile || !prezzoOfferto) {
    return res.status(400).json({ error: 'idImmobile e prezzoOfferto sono obbligatori' });
  }

  try {
    const offerta = await OffertaDAO.createOfferta(idImmobile, req.user.id, prezzoOfferto, offertaOriginaleId);
    res.status(201).json(offerta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'offerta' });
  }
}

// Creazione offerta manuale (solo agente)
export async function createManualOfferta(req: AuthRequest, res: Response) {
  const { idImmobile, prezzoOfferto, idCliente, offertaOriginaleId } = req.body;
  if (!idImmobile || !prezzoOfferto || !idCliente) {
    return res.status(400).json({ error: 'idImmobile, prezzoOfferto e idCliente sono obbligatori' });
  }

  try {
    const offerta = await OffertaDAO.createManualOfferta(idImmobile, idCliente, prezzoOfferto, offertaOriginaleId);
    res.status(201).json(offerta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'offerta manuale' });
  }
}

// Recupero storico offerte per immobile
export async function getOffertePerImmobile(req: AuthRequest, res: Response) {
  const { idImmobile } = req.params;

  try {
    const offerte = await OffertaDAO.getOffertePerImmobile(Number(idImmobile));
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

// Aggiorna stato offerta (solo agente/admin)
export async function updateOfferta(req: AuthRequest, res: Response) {
  const { idOfferta } = req.params;
  const { nuovoStato, prezzoControproposta } = req.body;

  if (!nuovoStato || !['Accettata', 'Rifiutata', 'Controproposta'].includes(nuovoStato)) {
    return res.status(400).json({ error: 'Stato non valido' });
  }

  try {
    const offerta = await OffertaDAO.getOffertaById(Number(idOfferta));
    if (!offerta) return res.status(404).json({ error: 'Offerta non trovata' });

    if (nuovoStato === 'Controproposta') {
      if (!prezzoControproposta) return res.status(400).json({ error: 'Prezzo della controproposta obbligatorio' });

      const nuovaOfferta = await OffertaDAO.createOfferta(
        offerta.idimmobile,
        offerta.idutente,
        prezzoControproposta,
        offerta.idofferta
      );
      return res.status(201).json(nuovaOfferta);
    }

    const offertaAggiornata = await OffertaDAO.updateStatoOfferta(Number(idOfferta), nuovoStato);
    res.json(offertaAggiornata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'offerta' });
  }
}
