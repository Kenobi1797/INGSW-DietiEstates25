import pool from '../config/db';

export async function createAgenziaDB(nome: string, idAmministratore: number) {
  const result = await pool.query(
    'INSERT INTO Agenzia (Nome, IdAmministratore, Attiva) VALUES ($1, $2, TRUE) RETURNING *',
    [nome, idAmministratore]
  );
  return result.rows[0];
}

export async function getAgenzieDB() {
  const result = await pool.query('SELECT * FROM Agenzia ORDER BY Nome ASC');
  return result.rows;
}

export async function getAgenziaById(idAgenzia: number) {
  const result = await pool.query('SELECT * FROM Agenzia WHERE IdAgenzia = $1', [idAgenzia]);
  return result.rows[0];
}

export async function updateAgenziaDB(idAgenzia: number, fields: string[], values: any[]) {
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const query = `UPDATE Agenzia SET ${setClause} WHERE IdAgenzia = $${fields.length + 1} RETURNING *`;
  const result = await pool.query(query, [...values, idAgenzia]);
  return result.rows[0];
}

export async function checkAdminExists(idAmministratore: number) {
  const result = await pool.query(
    'SELECT IdUtente FROM Utente WHERE IdUtente = $1 AND Ruolo = $2',
    [idAmministratore, 'AmministratoreAgenzia']
  );
  return result.rows.length > 0;
}
