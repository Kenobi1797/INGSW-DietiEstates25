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
    `INSERT INTO Offerta
     (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale, IdOffertaOriginale)
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
     FROM Offerta o
     JOIN Utente u ON o.IdUtente = u.IdUtente
     WHERE o.IdImmobile = $1
     ORDER BY o.DataOfferta DESC`,
    [idImmobile]
  );
  return result.rows.map(mapRowToOfferta);
};

export const getOffertePerUtente = async (idUtente: number): Promise<OffertaDTO[]> => {
  const result = await pool.query(
    `SELECT o.*, i.Titolo, i.Indirizzo
     FROM Offerta o
     JOIN Immobile i ON o.IdImmobile = i.IdImmobile
     WHERE o.IdUtente = $1
     ORDER BY o.DataOfferta DESC`,
    [idUtente]
  );
  return result.rows.map(mapRowToOfferta);
};

export const getOffertaById = async (idOfferta: number): Promise<OffertaDTO | null> => {
  const result = await pool.query('SELECT * FROM Offerta WHERE IdOfferta = $1', [idOfferta]);
  return result.rows[0] ? mapRowToOfferta(result.rows[0]) : null;
};

export const updateStatoOfferta = async (idOfferta: number, nuovoStato: string): Promise<OffertaDTO> => {
  const result = await pool.query(
    'UPDATE Offerta SET Stato = $1 WHERE IdOfferta = $2 RETURNING *',
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
    prezzoOfferto: row.prezzoofferto,
    stato: row.stato,
    dataOfferta: row.dataofferta,
    offertaManuale: row.offertamanuale,
    idOffertaOriginale: row.idoffertaoriginale ?? null
  });
}
