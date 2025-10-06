// src/controllers/immobileController.ts
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

// Ricerca avanzata immobili
export async function searchImmobili(req: Request, res: Response) {
  try {
    const queryParams = req.query;

    const tipologia = queryParams.tipologia as string | undefined;
    const prezzoMin = queryParams.prezzoMin as string | undefined;
    const prezzoMax = queryParams.prezzoMax as string | undefined;
    const numeroStanze = queryParams.numeroStanze as string | undefined;
    const classeEnergetica = queryParams.classeEnergetica as string | undefined;
    const balcone = queryParams.balcone as string | undefined;
    const terrazzo = queryParams.terrazzo as string | undefined;
    const giardino = queryParams.giardino as string | undefined;
    const ascensore = queryParams.ascensore as string | undefined;
    const postoAuto = queryParams.postoAuto as string | undefined;
    const cantina = queryParams.cantina as string | undefined;
    const portineria = queryParams.portineria as string | undefined;
    const climatizzazione = queryParams.climatizzazione as string | undefined;
    const scuoleVicine = queryParams.scuoleVicine as string | undefined;
    const parchiVicini = queryParams.parchiVicini as string | undefined;
    const trasportiPubbliciVicini = queryParams.trasportiPubbliciVicini as string | undefined;
    const citta = queryParams.citta as string | undefined;
    const latitudine = queryParams.latitudine as string | undefined;
    const longitudine = queryParams.longitudine as string | undefined;
    const raggioKm = queryParams.raggioKm as string | undefined;
    const orderBy = queryParams.orderBy as string | undefined;
    const orderDir = queryParams.orderDir as string | undefined;
    const limit = queryParams.limit ? Number(queryParams.limit) : 20;
    const offset = queryParams.offset ? Number(queryParams.offset) : 0;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Filtri base
    if (tipologia) { conditions.push(`Tipologia = $${i++}`); values.push(tipologia); }
    if (prezzoMin) { conditions.push(`Prezzo >= $${i++}`); values.push(Number(prezzoMin)); }
    if (prezzoMax) { conditions.push(`Prezzo <= $${i++}`); values.push(Number(prezzoMax)); }
    if (numeroStanze) { conditions.push(`NumeroStanze >= $${i++}`); values.push(Number(numeroStanze)); }
    if (classeEnergetica) { conditions.push(`ClasseEnergetica = $${i++}`); values.push(classeEnergetica); }

    // Filtri booleani
    const booleanFilters: { [key: string]: string | undefined } = {
      balcone, terrazzo, giardino, ascensore, postoAuto, cantina,
      portineria, climatizzazione, scuoleVicine, parchiVicini, trasportiPubbliciVicini
    };
    for (const key in booleanFilters) {
      const val = booleanFilters[key];
      if (val !== undefined) {
        conditions.push(`${key} = $${i++}`);
        values.push(val === 'true');
      }
    }

    // Filtro città/comune
    if (citta) {
      conditions.push(`Indirizzo ILIKE $${i++}`);
      values.push(`%${citta}%`);
    }

    // Filtraggio per distanza (Haversine)
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

    // Gestione ordine (default DataCreazione DESC)
    const allowedOrderFields = ['Prezzo', 'DataCreazione', 'distanza'];
    const orderField = typeof orderBy === 'string' && allowedOrderFields.includes(orderBy) ? orderBy : 'DataCreazione';
    const orderDirection = typeof orderDir === 'string' && orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT * ${distanceSelect}
      FROM Immobile
      ${whereClause}
      ORDER BY ${orderField} ${orderDirection}
      LIMIT $${i++} OFFSET $${i++}
    `;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la ricerca degli immobili' });
  }
}