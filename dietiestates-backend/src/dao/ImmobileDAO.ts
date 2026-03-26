import pool from '../config/db';
import { ImmobileDTO } from '../dto/ImmobileDTO';
import { getNearbyPlaces } from '../utils/geoapify';

function mapRowToImmobile(row: any) {
  return {
    id: row.idimmobile,
    idImmobile: row.idimmobile,
    idAgente: row.idagente,
    titolo: row.titolo,
    descrizione: row.descrizione,
    prezzo: Number.parseFloat(row.prezzo),
    dimensioni: row.dimensioni == null ? null : Number.parseFloat(row.dimensioni),
    indirizzo: row.indirizzo,
    numeroStanze: row.numerostanze,
    numeroBagni: row.numerobagni,
    piano: row.piano,
    ascensore: row.ascensore,
    balcone: row.balcone,
    terrazzo: row.terrazzo,
    giardino: row.giardino,
    postoAuto: row.postoauto,
    cantina: row.cantina,
    portineria: row.portineria,
    climatizzazione: row.climatizzazione,
    riscaldamento: row.riscaldamento,
    scuoleVicine: row.scuolevicine,
    parchiVicini: row.parchivicini,
    trasportiPubbliciVicini: row.trasportipubblicivicini,
    classeEnergetica: row.classeenergetica,
    tipologia: row.tipologia,
    latitudine: Number.parseFloat(row.latitudine),
    longitudine: Number.parseFloat(row.longitudine),
    fotoUrls: row.fotourls || [],
    dataCreazione: row.datacreazione,
    venduto: row.venduto,
    dataVendita: row.datavendita,
    distanza: row.distanza == null ? null : Number.parseFloat(row.distanza),
    serviziVicinati: row.scuolevicine || row.parchivicini || row.trasportipubblicivicini
  };
}

export async function createImmobile(data: ImmobileDTO) {
  // Determina luoghi vicini
  const nearbyPlaces = await getNearbyPlaces(data.latitudine, data.longitudine);

  const scuoleVicine = nearbyPlaces.some(p => p.type === 'education.school');
  const parchiVicini = nearbyPlaces.some(p => p.type === 'leisure.park');
  const trasportiPubbliciVicini = nearbyPlaces.some(p => 
    p.type.startsWith('public_transport') ||
    ['bus_stop', 'tram_stop', 'subway_entrance', 'railway.station'].includes(p.type)
  );

  const result = await pool.query(
    `INSERT INTO Immobile (
      IdAgente, Titolo, Descrizione, Prezzo, Dimensioni, Indirizzo, NumeroStanze, NumeroBagni, Piano,
      Ascensore, Balcone, Terrazzo, Giardino, PostoAuto, Cantina, Portineria, Climatizzazione, Riscaldamento,
      ScuoleVicine, ParchiVicini, TrasportiPubbliciVicini, ClasseEnergetica, Tipologia, Latitudine, Longitudine, FotoUrls
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26
    ) RETURNING *`,
    [
      data.idAgente, data.titolo, data.descrizione || null, data.prezzo, data.dimensioni || null, data.indirizzo,
      data.numeroStanze || null, data.numeroBagni || null, data.piano ?? null,
      data.ascensore || false, data.balcone || false, data.terrazzo || false, data.giardino || false,
      data.postoAuto || false, data.cantina || false, data.portineria || false, data.climatizzazione || false,
      data.riscaldamento || null,
      scuoleVicine, parchiVicini, trasportiPubbliciVicini,
      data.classeEnergetica || null, data.tipologia, data.latitudine, data.longitudine,
      data.fotoUrls && data.fotoUrls.length > 0 ? data.fotoUrls : null
    ]
  );

  return mapRowToImmobile(result.rows[0]);
}

export async function searchImmobili(filters: any) {
  const {
    tipologia, prezzoMin, prezzoMax, numeroStanze, numeroStanzeMin, numeroStanzeMax, numeroBagni, classeEnergetica,
    balcone, terrazzo, giardino, ascensore, postoAuto, cantina,
    portineria, climatizzazione, scuoleVicine, parchiVicini, trasportiPubbliciVicini,
    citta, latitudine, longitudine, raggioKm,
    orderBy, orderDir, limit = 20, offset = 0
  } = filters;

  const conditions: string[] = [];
  const values: any[] = [];
  let i = 1;

  const add = (cond: string, val: any) => { conditions.push(cond); values.push(val); i++; };

  if (tipologia) add(`Tipologia = $${i}`, tipologia);
  if (prezzoMin) add(`Prezzo >= $${i}`, +prezzoMin);
  if (prezzoMax) add(`Prezzo <= $${i}`, +prezzoMax);
  if (numeroStanze) add(`NumeroStanze >= $${i}`, +numeroStanze);
  if (numeroStanzeMin) add(`NumeroStanze >= $${i}`, +numeroStanzeMin);
  if (numeroStanzeMax) add(`NumeroStanze <= $${i}`, +numeroStanzeMax);
  if (numeroBagni) add(`NumeroBagni >= $${i}`, +numeroBagni);
  if (classeEnergetica) add(`ClasseEnergetica = $${i}`, classeEnergetica);

  const bools = { balcone, terrazzo, giardino, ascensore, postoAuto, cantina,
    portineria, climatizzazione, scuoleVicine, parchiVicini, trasportiPubbliciVicini };
  for (const [k, v] of Object.entries(bools)) if (v !== undefined) add(`${k} = $${i}`, v === 'true');

  if (citta) add(`Indirizzo ILIKE $${i}`, `%${citta}%`);

  let distanceSelect = '';
  if (latitudine && longitudine && raggioKm) {
    const [lat, lng, raggio] = [+latitudine, +longitudine, +raggioKm];

    // Snapshot degli indici PRIMA di pushare
    const iLat = i;
    const iLng = i + 1;
    const iRaggio = i + 2;

    values.push(lat, lng, raggio);
    i += 3;

    distanceSelect = `,
      (6371 * acos(LEAST(1.0,
        cos(radians($${iLat})) * cos(radians(Latitudine)) *
        cos(radians(Longitudine) - radians($${iLng})) +
        sin(radians($${iLat})) * sin(radians(Latitudine))
      ))) AS distanza`;

    conditions.push(`
      (6371 * acos(LEAST(1.0,
        cos(radians($${iLat})) * cos(radians(Latitudine)) *
        cos(radians(Longitudine) - radians($${iLng})) +
        sin(radians($${iLat})) * sin(radians(Latitudine))
      ))) <= $${iRaggio}`
    );
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const allowedOrderFields = ['Prezzo', 'DataCreazione', 'distanza'];
  const field = allowedOrderFields.includes(orderBy) ? orderBy : 'DataCreazione';
  const dir = orderDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  values.push(limit, offset);
  const query = `
    SELECT * ${distanceSelect}
    FROM Immobile
    ${where}
    ORDER BY ${field} ${dir}
    LIMIT $${i++} OFFSET $${i++}`;
  
  const result = await pool.query(query, values);
  return result.rows.map(mapRowToImmobile);
}

export async function getImmobileById(idImmobile: number) {
  const result = await pool.query(
    `SELECT * FROM Immobile WHERE IdImmobile = $1`,
    [idImmobile]
  );

  if (result.rows.length === 0) return null;
  return mapRowToImmobile(result.rows[0]);
}

export async function getImmobiliByAgente(idAgente: number) {
  const result = await pool.query(
    `SELECT * FROM Immobile WHERE IdAgente = $1 ORDER BY DataCreazione DESC`,
    [idAgente]
  );

  return result.rows.map(mapRowToImmobile);
}