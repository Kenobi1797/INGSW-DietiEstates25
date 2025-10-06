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
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26
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

// Ricerca immobili
export async function searchImmobili(req: Request, res: Response) {
  try {
    const {
      tipologia,
      prezzoMin,
      prezzoMax,
      numeroStanze,
      classeEnergetica,
      latitudine,
      longitudine,
      raggioKm,
      limit = 20,
      offset = 0
    } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];

    let i = 1;

    if (tipologia) { conditions.push(`Tipologia = $${i++}`); values.push(tipologia); }
    if (prezzoMin) { conditions.push(`Prezzo >= $${i++}`); values.push(Number(prezzoMin)); }
    if (prezzoMax) { conditions.push(`Prezzo <= $${i++}`); values.push(Number(prezzoMax)); }
    if (numeroStanze) { conditions.push(`NumeroStanze >= $${i++}`); values.push(Number(numeroStanze)); }
    if (classeEnergetica) { conditions.push(`ClasseEnergetica = $${i++}`); values.push(classeEnergetica); }

    // Filtraggio per distanza (raggioKm) usando formula Haversine
    let distanceSelect = '';
    if (latitudine && longitudine && raggioKm) {
      const lat = Number(latitudine);
      const lng = Number(longitudine);
      const raggio = Number(raggioKm);

      distanceSelect = `, (6371 * acos(
        cos(radians($${i})) * cos(radians(Latitudine)) * cos(radians(Longitudine) - radians($${i+1}))
        + sin(radians($${i})) * sin(radians(Latitudine))
      )) AS distanza`;
      values.push(lat, lng);
      i += 2;

      conditions.push(`(6371 * acos(
        cos(radians($${i-2})) * cos(radians(Latitudine)) * cos(radians(Longitudine) - radians($${i-1}))
        + sin(radians($${i-2})) * sin(radians(Latitudine))
      )) <= $${i++}`);
      values.push(raggio);
    }

    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const query = `
      SELECT * ${distanceSelect}
      FROM Immobile
      ${whereClause}
      ORDER BY DataCreazione DESC
      LIMIT $${i++} OFFSET $${i++}
    `;
    values.push(Number(limit), Number(offset));

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la ricerca degli immobili' });
  }
}