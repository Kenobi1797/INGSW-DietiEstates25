import pool from '../config/db';

export async function createOfferta(idImmobile: number, idUtente: number, prezzoOfferto: number, offertaOriginaleId?: number) {
  const result = await pool.query(
    `INSERT INTO Offerta 
     (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale, IdOffertaOriginale)
     VALUES ($1, $2, $3, 'InAttesa', FALSE, $4)
     RETURNING *`,
    [idImmobile, idUtente, prezzoOfferto, offertaOriginaleId || null]
  );
  return result.rows[0];
}

export async function createManualOfferta(idImmobile: number, idCliente: number, prezzoOfferto: number, offertaOriginaleId?: number) {
  const result = await pool.query(
    `INSERT INTO Offerta 
     (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale, IdOffertaOriginale)
     VALUES ($1, $2, $3, 'InAttesa', TRUE, $4)
     RETURNING *`,
    [idImmobile, idCliente, prezzoOfferto, offertaOriginaleId || null]
  );
  return result.rows[0];
}

export async function getOffertePerImmobile(idImmobile: number) {
  const result = await pool.query(
    `SELECT o.*, u.nome, u.cognome, u.email 
     FROM Offerta o
     JOIN Utente u ON o.IdUtente = u.IdUtente
     WHERE o.IdImmobile = $1
     ORDER BY o.DataOfferta DESC`,
    [idImmobile]
  );
  return result.rows;
}

export async function getOffertePerUtente(idUtente: number) {
  const result = await pool.query(
    `SELECT o.*, i.Titolo, i.Indirizzo
     FROM Offerta o
     JOIN Immobile i ON o.IdImmobile = i.IdImmobile
     WHERE o.IdUtente = $1
     ORDER BY o.DataOfferta DESC`,
    [idUtente]
  );
  return result.rows;
}

export async function getOffertaById(idOfferta: number) {
  const result = await pool.query('SELECT * FROM Offerta WHERE IdOfferta = $1', [idOfferta]);
  return result.rows[0];
}

export async function updateStatoOfferta(idOfferta: number, nuovoStato: string) {
  const result = await pool.query(
    'UPDATE Offerta SET Stato = $1 WHERE IdOfferta = $2 RETURNING *',
    [nuovoStato, idOfferta]
  );
  return result.rows[0];
}
