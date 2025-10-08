import pool from '../config/db';
import { getNearbyPlaces } from '../utils/geoapify';

export async function createImmobile(data: {
  agenteId: number,
  titolo: string,
  descrizione?: string,
  prezzo: number,
  dimensioni?: number,
  indirizzo: string,
  numeroStanze?: number,
  numeroBagni?: number,
  piano?: number,
  ascensore?: boolean,
  balcone?: boolean,
  terrazzo?: boolean,
  giardino?: boolean,
  postoAuto?: boolean,
  cantina?: boolean,
  portineria?: boolean,
  climatizzazione?: boolean,
  riscaldamento?: string,
  classeEnergetica?: string,
  tipologia: string,
  latitudine: number,
  longitudine: number,
  fotoUrls?: string[]
}) {
  // 🚀 Determina luoghi vicini
  const nearbyPlaces = await getNearbyPlaces(data.latitudine, data.longitudine);

  const scuoleVicine = nearbyPlaces.some(p => p.type === 'education.school');
  const parchiVicini = nearbyPlaces.some(p => p.type === 'leisure.park');
  const trasportiPubbliciVicini = nearbyPlaces.some(p => 
    ['public_transport.stop_position', 'bus_stop', 'tram_stop', 'subway_entrance', 'railway.station'].includes(p.type)
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
      data.agenteId, data.titolo, data.descrizione || null, data.prezzo, data.dimensioni || null, data.indirizzo,
      data.numeroStanze || null, data.numeroBagni || null, data.piano || null,
      data.ascensore || false, data.balcone || false, data.terrazzo || false, data.giardino || false,
      data.postoAuto || false, data.cantina || false, data.portineria || false, data.climatizzazione || false,
      data.riscaldamento || null,
      scuoleVicine, parchiVicini, trasportiPubbliciVicini,
      data.classeEnergetica || null, data.tipologia, data.latitudine, data.longitudine, data.fotoUrls || null
    ]
  );
  return result.rows[0];
}

export async function searchImmobili(filters: any) {
  const {
    tipologia, prezzoMin, prezzoMax, numeroStanze, classeEnergetica,
    balcone, terrazzo, giardino, ascensore, postoAuto, cantina,
    portineria, climatizzazione, scuoleVicine, parchiVicini, trasportiPubbliciVicini,
    citta, latitudine, longitudine, raggioKm,
    orderBy, orderDir, limit = 20, offset = 0
  } = filters;

  const conditions: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (tipologia) { conditions.push(`Tipologia = $${i++}`); values.push(tipologia); }
  if (prezzoMin) { conditions.push(`Prezzo >= $${i++}`); values.push(Number(prezzoMin)); }
  if (prezzoMax) { conditions.push(`Prezzo <= $${i++}`); values.push(Number(prezzoMax)); }
  if (numeroStanze) { conditions.push(`NumeroStanze >= $${i++}`); values.push(Number(numeroStanze)); }
  if (classeEnergetica) { conditions.push(`ClasseEnergetica = $${i++}`); values.push(classeEnergetica); }

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

  if (citta) {
    conditions.push(`Indirizzo ILIKE $${i++}`);
    values.push(`%${citta}%`);
  }

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
  const allowedOrderFields = ['Prezzo', 'DataCreazione', 'distanza'];
  const orderField = allowedOrderFields.includes(orderBy) ? orderBy : 'DataCreazione';
  const orderDirection = orderDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const query = `
    SELECT * ${distanceSelect}
    FROM Immobile
    ${whereClause}
    ORDER BY ${orderField} ${orderDirection}
    LIMIT $${i++} OFFSET $${i++}
  `;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
}
