import pool from '../config/db';

const insertOfferta = async (idImmobile: number, idUtente: number, prezzoOfferto: number, offertaManuale: boolean, offertaOriginaleId?: number) => {
  const result = await pool.query(
    `INSERT INTO Offerta 
     (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale, IdOffertaOriginale)
     VALUES ($1, $2, $3, 'InAttesa', $4, $5)
     RETURNING *`,
    [idImmobile, idUtente, prezzoOfferto, offertaManuale, offertaOriginaleId || null]
  );
  return result.rows[0];
};

export const createOfferta = (idImmobile: number, idUtente: number, prezzoOfferto: number, offertaOriginaleId?: number) =>
  insertOfferta(idImmobile, idUtente, prezzoOfferto, false, offertaOriginaleId);

export const createManualOfferta = (idImmobile: number, idCliente: number, prezzoOfferto: number, offertaOriginaleId?: number) =>
  insertOfferta(idImmobile, idCliente, prezzoOfferto, true, offertaOriginaleId);

export const getOffertePerImmobile = (idImmobile: number) =>
  pool.query(
    `SELECT o.*, u.nome, u.cognome, u.email 
     FROM Offerta o
     JOIN Utente u ON o.IdUtente = u.IdUtente
     WHERE o.IdImmobile = $1
     ORDER BY o.DataOfferta DESC`,
    [idImmobile]
  ).then(r => r.rows);

export const getOffertePerUtente = (idUtente: number) =>
  pool.query(
    `SELECT o.*, i.Titolo, i.Indirizzo
     FROM Offerta o
     JOIN Immobile i ON o.IdImmobile = i.IdImmobile
     WHERE o.IdUtente = $1
     ORDER BY o.DataOfferta DESC`,
    [idUtente]
  ).then(r => r.rows);

export const getOffertaById = (idOfferta: number) =>
  pool.query('SELECT * FROM Offerta WHERE IdOfferta = $1', [idOfferta])
      .then(r => r.rows[0]);

export const updateStatoOfferta = (idOfferta: number, nuovoStato: string) =>
  pool.query('UPDATE Offerta SET Stato = $1 WHERE IdOfferta = $2 RETURNING *', [nuovoStato, idOfferta])
      .then(r => r.rows[0]);
