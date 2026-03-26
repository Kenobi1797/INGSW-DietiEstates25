import pool from '../config/db';
import { OffertaDTO, OffertaSchema } from '../dto/OffertaDTO';

const insertOfferta = async (
  idImmobile: number,
  idUtente: number,
  prezzoOfferto: number,
  offertaManuale: boolean,
  offertaOriginaleId?: number
): Promise<OffertaDTO> => {
  const result = await pool.query(
    `INSERT INTO offerta
     (idimmobile, idutente, prezzoofferto, stato, offertamanuale, idoffertaoriginale)
     VALUES ($1, $2, $3, 'InAttesa', $4, $5)
     RETURNING *`,
    [idImmobile, idUtente, prezzoOfferto, offertaManuale, offertaOriginaleId || null]
  );

  return mapRowToOfferta(result.rows[0]);
};

export const createOfferta = (idImmobile: number, idUtente: number, prezzoOfferto: number, offertaOriginaleId?: number) =>
  insertOfferta(idImmobile, idUtente, prezzoOfferto, false, offertaOriginaleId);

export const createManualOfferta = (idImmobile: number, idCliente: number, prezzoOfferto: number, offertaOriginaleId?: number) =>
  insertOfferta(idImmobile, idCliente, prezzoOfferto, true, offertaOriginaleId);

export const getOffertePerImmobile = async (idImmobile: number): Promise<OffertaDTO[]> => {
  const result = await pool.query(
    `SELECT o.*, u.nome, u.cognome, u.email
     FROM offerta o
     JOIN utente u ON o.idutente = u.idutente
     WHERE o.idimmobile = $1
     ORDER BY o.dataofferta DESC`,
    [idImmobile]
  );
  return result.rows.map(mapRowToOfferta);
};

export const getOffertePerUtente = async (idUtente: number): Promise<OffertaDTO[]> => {
  const result = await pool.query(
    `SELECT o.*, i.titolo, i.indirizzo
     FROM offerta o
     JOIN immobile i ON o.idimmobile = i.idimmobile
     WHERE o.idutente = $1
     ORDER BY o.dataofferta DESC`,
    [idUtente]
  );
  return result.rows.map(mapRowToOfferta);
};

export const getOffertePerAgente = async (idAgente: number): Promise<OffertaDTO[]> => {
  const result = await pool.query(
    `SELECT o.*, i.titolo, i.indirizzo, u.nome, u.cognome, u.email
     FROM offerta o
     JOIN immobile i ON o.idimmobile = i.idimmobile
     JOIN utente u ON o.idutente = u.idutente
     WHERE i.idagente = $1
     ORDER BY o.dataofferta DESC`,
    [idAgente]
  );
  return result.rows.map(mapRowToOfferta);
};

export const getAllOfferte = async (): Promise<OffertaDTO[]> => {
  const result = await pool.query(
    `SELECT o.*, i.titolo, i.indirizzo
     FROM offerta o
     JOIN immobile i ON o.idimmobile = i.idimmobile
     ORDER BY o.dataofferta DESC`
  );
  return result.rows.map(mapRowToOfferta);
};

export const getControffertePerCliente = async (idUtente: number): Promise<OffertaDTO[]> => {
  const result = await pool.query(
    `SELECT o.*, i.titolo, i.indirizzo
     FROM offerta o
     JOIN immobile i ON o.idimmobile = i.idimmobile
     WHERE o.idutente = $1 AND o.idoffertaoriginale IS NOT NULL
     ORDER BY o.dataofferta DESC`,
    [idUtente]
  );
  return result.rows.map(mapRowToOfferta);
};

export const getOffertaById = async (idOfferta: number): Promise<OffertaDTO | null> => {
  const result = await pool.query('SELECT * FROM offerta WHERE idofferta = $1', [idOfferta]);
  return result.rows[0] ? mapRowToOfferta(result.rows[0]) : null;
};

export const updateStatoOfferta = async (idOfferta: number, nuovoStato: string): Promise<OffertaDTO> => {
  const result = await pool.query(
    'UPDATE offerta SET stato = $1 WHERE idofferta = $2 RETURNING *',
    [nuovoStato, idOfferta]
  );
  return mapRowToOfferta(result.rows[0]);
};

// Mappatura DB → DTO con validazione Zod
function mapRowToOfferta(row: any): OffertaDTO {
  return OffertaSchema.parse({
    idOfferta: row.idofferta,
    idImmobile: row.idimmobile,
    idUtente: row.idutente,
    prezzoOfferto: parseFloat(row.prezzoofferto), 
    stato: row.stato,
    dataOfferta: row.dataofferta,
    offertaManuale: row.offertamanuale,
    idOffertaOriginale: row.idoffertaoriginale ?? null,
    titolo: row.titolo,
    indirizzo: row.indirizzo
  });
}