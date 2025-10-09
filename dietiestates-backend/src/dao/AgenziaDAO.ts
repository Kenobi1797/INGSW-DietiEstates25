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

export const updateAgenziaDB = (idAgenzia: number, fields: string[], values: any[]) => {
  const allowed = ['Nome', 'Attiva'];
  const safeFields = fields.filter(f => allowed.includes(f));
  if (!safeFields.length) throw new Error('Nessun campo valido da aggiornare');

  const setClause = safeFields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  return pool.query(
    `UPDATE Agenzia SET ${setClause} WHERE IdAgenzia = $${safeFields.length + 1} RETURNING *`,
    [...values, idAgenzia]
  ).then(r => r.rows[0]);
};


export async function checkAdminExists(idAmministratore: number) {
  const result = await pool.query(
    'SELECT IdUtente FROM Utente WHERE IdUtente = $1 AND Ruolo = $2',
    [idAmministratore, 'AmministratoreAgenzia']
  );
  return result.rows.length > 0;
}
