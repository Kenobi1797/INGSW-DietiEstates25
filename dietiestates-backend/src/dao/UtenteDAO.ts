import pool from '../config/db';
import bcrypt from 'bcrypt';
import { UtenteDTO } from '../dto/UtenteDTO';

// Controlla se esiste un'email
export async function checkEmailExists(email: string): Promise<boolean> {
  const result = await pool.query('SELECT IdUtente FROM Utente WHERE Email = $1', [email]);
  return result.rows.length > 0;
}

// Recupera utente per email
export async function getUtenteByEmail(email: string): Promise<UtenteDTO | null> {
  const result = await pool.query('SELECT * FROM Utente WHERE Email = $1', [email]);
  return result.rows[0] ? mapRowToUtente(result.rows[0]) : null;
}

// Recupera utente per ID
export async function getUtenteById(id: number): Promise<UtenteDTO | null> {
  const result = await pool.query('SELECT * FROM Utente WHERE IdUtente = $1', [id]);
  return result.rows[0] ? mapRowToUtente(result.rows[0]) : null;
}

type CreateUserData = Omit<UtenteDTO, 'idUtente' | 'ruolo' | 'dataCreazione' | 'passwordHash'> & { password: string };

type CreateAgentData = CreateUserData & { idAgenzia: number };

// Cambia password
export async function changePassword(id: number, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE Utente SET PasswordHash = $1 WHERE IdUtente = $2', [passwordHash, id]);
}

// Crea cliente
export async function createCliente(
  data: CreateUserData
): Promise<UtenteDTO> {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const result = await pool.query(
    `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo)
     VALUES ($1, $2, $3, $4, 'Cliente')
     RETURNING *`,
    [data.nome, data.cognome, data.email, passwordHash]
  );
  return mapRowToUtente(result.rows[0]);
}

// Crea agente
export async function createAgent(
  data: CreateAgentData
): Promise<UtenteDTO & { idAgenzia: number }> {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const result = await pool.query(
    `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo, IdAgenzia)
     VALUES ($1, $2, $3, $4, 'Agente', $5)
     RETURNING *`,
    [data.nome, data.cognome, data.email, passwordHash, data.idAgenzia]
  );
  return { ...mapRowToUtente(result.rows[0]), idAgenzia: result.rows[0].idagenzia };
}

// Crea supporto
export async function createSupport(
  data: Omit<UtenteDTO, 'idUtente' | 'ruolo' | 'dataCreazione' | 'passwordHash'> & { password: string; idAgenzia?: number | null }
): Promise<UtenteDTO> {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const result = await pool.query(
    `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo, IdAgenzia)
     VALUES ($1, $2, $3, $4, 'Supporto', $5)
     RETURNING *`,
    [data.nome, data.cognome, data.email, passwordHash, data.idAgenzia ?? null]
  );
  return mapRowToUtente(result.rows[0]);
}

// Recupera o crea un cliente tecnico da usare per offerte manuali senza idCliente esplicito
export async function getOrCreateManualCliente(): Promise<number> {
  const manualEmail = 'cliente.manuale@dietiestates.com';

  const existing = await pool.query('SELECT IdUtente FROM Utente WHERE Email = $1', [manualEmail]);
  if (existing.rows.length > 0) {
    return existing.rows[0].idutente;
  }

  const passwordHash = await bcrypt.hash('ClienteManuale123!', 10);
  const created = await pool.query(
    `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo)
     VALUES ($1, $2, $3, $4, 'Cliente')
     RETURNING IdUtente`,
    ['Cliente', 'Manuale', manualEmail, passwordHash]
  );

  return created.rows[0].idutente;
}

// Funzione di mappatura database → DTO
function mapRowToUtente(row: any): UtenteDTO {
  return {
    idUtente: row.idutente,
    nome: row.nome,
    cognome: row.cognome,
    email: row.email,
    ruolo: row.ruolo,
    passwordHash: row.passwordhash,
    dataCreazione: row.datacreazione,
    idAgenzia: row.idagenzia || null,
  };
}
