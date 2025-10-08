import pool from '../config/db';
import bcrypt from 'bcrypt';

export async function checkEmailExists(email: string) {
  const result = await pool.query('SELECT IdUtente FROM Utente WHERE Email = $1', [email]);
  return result.rows.length > 0;
}

export async function createCliente(nome: string, cognome: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo)
     VALUES ($1, $2, $3, $4, 'Cliente')
     RETURNING IdUtente, Nome, Cognome, Email, Ruolo, DataCreazione`,
    [nome, cognome, email, passwordHash]
  );
  return result.rows[0];
}

export async function getUtenteByEmail(email: string) {
  const result = await pool.query('SELECT * FROM Utente WHERE Email = $1', [email]);
  return result.rows[0];
}

export async function createAgent(nome: string, cognome: string, email: string, password: string, idAgenzia: number) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo)
     VALUES ($1, $2, $3, $4, 'Agente')
     RETURNING IdUtente, Nome, Cognome, Email, Ruolo, DataCreazione`,
    [nome, cognome, email, passwordHash]
  );
  return { ...result.rows[0], idAgenzia };
}

export async function createSupport(nome: string, cognome: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo)
     VALUES ($1, $2, $3, $4, 'Supporto')
     RETURNING IdUtente, Nome, Cognome, Email, Ruolo, DataCreazione`,
    [nome, cognome, email, passwordHash]
  );
  return result.rows[0];
}

export async function getUtenteById(id: number) {
  const result = await pool.query('SELECT * FROM Utente WHERE IdUtente = $1', [id]);
  return result.rows[0];
}

export async function changePassword(id: number, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Utente SET PasswordHash = $1 WHERE IdUtente = $2', [passwordHash, id]);
}
