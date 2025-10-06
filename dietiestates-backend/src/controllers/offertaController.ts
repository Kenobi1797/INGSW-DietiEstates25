import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Creazione nuova offerta
export async function createOfferta(req: AuthRequest, res: Response) {
  const { idImmobile, prezzoOfferto, offertaOriginaleId } = req.body;

  if (!idImmobile || !prezzoOfferto) {
    return res.status(400).json({ error: 'idImmobile e prezzoOfferto sono obbligatori' });
  }

  try {
    const idUtente = req.user.id;
    const result = await pool.query(
      `INSERT INTO Offerta 
       (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale, IdOffertaOriginale)
       VALUES ($1, $2, $3, 'InAttesa', FALSE, $4)
       RETURNING *`,
      [idImmobile, idUtente, prezzoOfferto, offertaOriginaleId || null]
    );

    res.status(201).json(result.rows[0]);
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
    const agenteId = req.user.id;
    const result = await pool.query(
      `INSERT INTO Offerta 
       (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale, IdOffertaOriginale)
       VALUES ($1, $2, $3, 'InAttesa', TRUE, $4)
       RETURNING *`,
      [idImmobile, idCliente, prezzoOfferto, offertaOriginaleId || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'offerta manuale' });
  }
}

// Recupero storico offerte per immobile
export async function getOffertePerImmobile(req: AuthRequest, res: Response) {
  const { idImmobile } = req.params;

  try {
    const result = await pool.query(
      `SELECT o.*, u.nome, u.cognome, u.email 
       FROM Offerta o
       JOIN Utente u ON o.IdUtente = u.IdUtente
       WHERE o.IdImmobile = $1
       ORDER BY o.DataOfferta DESC`,
      [idImmobile]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle offerte' });
  }
}

// Recupero storico offerte per utente
export async function getOffertePerUtente(req: AuthRequest, res: Response) {
  const idUtente = req.user.id;

  try {
    const result = await pool.query(
      `SELECT o.*, i.Titolo, i.Indirizzo
       FROM Offerta o
       JOIN Immobile i ON o.IdImmobile = i.IdImmobile
       WHERE o.IdUtente = $1
       ORDER BY o.DataOfferta DESC`,
      [idUtente]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle offerte dell\'utente' });
  }
}

// Aggiorna stato offerta (solo agente/admin)
export async function updateOfferta(req: AuthRequest, res: Response) {
  const { idOfferta } = req.params;
  const { nuovoStato, prezzoControproposta } = req.body; // nuovoStato: "Accettata" | "Rifiutata" | "Controproposta"

  if (!nuovoStato || !['Accettata', 'Rifiutata', 'Controproposta'].includes(nuovoStato)) {
    return res.status(400).json({ error: 'Stato non valido' });
  }

  try {
    // Verifica che l'offerta esista
    const { rows } = await pool.query('SELECT * FROM Offerta WHERE IdOfferta = $1', [idOfferta]);
    if (!rows.length) return res.status(404).json({ error: 'Offerta non trovata' });

    const offerta = rows[0];

    if (nuovoStato === 'Controproposta') {
      if (!prezzoControproposta) {
        return res.status(400).json({ error: 'Prezzo della controproposta obbligatorio' });
      }

      // Crea nuova offerta collegata all'originale
      const result = await pool.query(
        `INSERT INTO Offerta
         (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale, IdOffertaOriginale)
         VALUES ($1, $2, $3, 'InAttesa', FALSE, $4)
         RETURNING *`,
        [offerta.idimmobile, offerta.idutente, prezzoControproposta, offerta.idofferta]
      );

      return res.status(201).json(result.rows[0]);
    }

    // Aggiorna stato semplice
    const result = await pool.query(
      'UPDATE Offerta SET Stato = $1 WHERE IdOfferta = $2 RETURNING *',
      [nuovoStato, idOfferta]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'offerta' });
  }
}