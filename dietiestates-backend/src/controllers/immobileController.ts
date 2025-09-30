import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Creazione nuovo immobile
export async function createImmobile(req: AuthRequest, res: Response) {
  const {
    titolo,
    descrizione,
    prezzo,
    dimensioni,
    indirizzo,
    numeroStanze,
    numeroBagni,
    piano,
    ascensore,
    balcone,
    terrazzo,
    giardino,
    postoAuto,
    cantina,
    portineria,
    climatizzazione,
    riscaldamento,
    scuoleVicine,
    parchiVicini,
    trasportiPubbliciVicini,
    classeEnergetica,
    tipologia,
    latitudine,
    longitudine,
    fotoUrls
  } = req.body;

  if (!titolo || !prezzo || !indirizzo || !tipologia || !latitudine || !longitudine) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {
    const agenteId = req.user.id;

    const result = await pool.query(
      `INSERT INTO Immobile (
        IdAgente, Titolo, Descrizione, Prezzo, Dimensioni, Indirizzo, NumeroStanze, NumeroBagni, Piano,
        Ascensore, Balcone, Terrazzo, Giardino, PostoAuto, Cantina, Portineria, Climatizzazione, Riscaldamento,
        ScuoleVicine, ParchiVicini, TrasportiPubbliciVicini, ClasseEnergetica, Tipologia, Latitudine, Longitudine, FotoUrls
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      ) RETURNING *`,
      [
        agenteId, titolo, descrizione || null, prezzo, dimensioni || null, indirizzo,
        numeroStanze || null, numeroBagni || null, piano || null,
        ascensore || false, balcone || false, terrazzo || false, giardino || false,
        postoAuto || false, cantina || false, portineria || false, climatizzazione || false, riscaldamento || null,
        scuoleVicine || false, parchiVicini || false, trasportiPubbliciVicini || false,
        classeEnergetica || null, tipologia, latitudine, longitudine, fotoUrls || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'immobile' });
  }
}
