import pool from '../config/db';
import { ImmobileDTO } from '../dto/ImmobileDTO';
import { getNearbyPlaces } from '../utils/geoapify';

export async function createImmobile(data: ImmobileDTO) {
  // Determina luoghi vicini
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
      data.idAgente, data.titolo, data.descrizione || null, data.prezzo, data.dimensioni || null, data.indirizzo,
      data.numeroStanze || null, data.numeroBagni || null, data.piano || null,
      data.ascensore || false, data.balcone || false, data.terrazzo || false, data.giardino || false,
      data.postoAuto || false, data.cantina || false, data.portineria || false, data.climatizzazione || false,
      data.riscaldamento || null,
      scuoleVicine, parchiVicini, trasportiPubbliciVicini,
      data.classeEnergetica || null, data.tipologia, data.latitudine, data.longitudine, data.fotoUrls || null
    ]
  );

  const saved = result.rows[0];
  const serviziVicinati = scuoleVicine || parchiVicini || trasportiPubbliciVicini;
  return { ...saved, serviziVicinati };
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

  const add = (cond: string, val: any) => { conditions.push(cond); values.push(val); i++; };

  if (tipologia) add(`Tipologia = $${i}`, tipologia);
  if (prezzoMin) add(`Prezzo >= $${i}`, +prezzoMin);
  if (prezzoMax) add(`Prezzo <= $${i}`, +prezzoMax);
  if (numeroStanze) add(`NumeroStanze >= $${i}`, +numeroStanze);
  if (classeEnergetica) add(`ClasseEnergetica = $${i}`, classeEnergetica);

  const bools = { balcone, terrazzo, giardino, ascensore, postoAuto, cantina,
    portineria, climatizzazione, scuoleVicine, parchiVicini, trasportiPubbliciVicini };
  for (const [k, v] of Object.entries(bools)) if (v !== undefined) add(`${k} = $${i}`, v === 'true');

  if (citta) add(`Indirizzo ILIKE $${i}`, `%${citta}%`);

  let distanceSelect = '';
  if (latitudine && longitudine && raggioKm) {
    const [lat, lng, raggio] = [+latitudine, +longitudine, +raggioKm];
    distanceSelect = `,
      (6371 * acos(
        cos(radians($${i})) * cos(radians(Latitudine)) *
        cos(radians(Longitudine) - radians($${i+1})) +
        sin(radians($${i})) * sin(radians(Latitudine))
      )) AS distanza`;
    values.push(lat, lng); i += 2;
    add(`(6371 * acos(
      cos(radians($${i-2})) * cos(radians(Latitudine)) *
      cos(radians(Longitudine) - radians($${i-1})) +
      sin(radians($${i-2})) * sin(radians(Latitudine))
    )) <= $${i}`, raggio);
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
  return result.rows.map((immobile: any) => ({
    ...immobile,
    serviziVicinati: immobile.scuolevicine || immobile.parchivicini || immobile.trasportipubblicivicini
  }));
}