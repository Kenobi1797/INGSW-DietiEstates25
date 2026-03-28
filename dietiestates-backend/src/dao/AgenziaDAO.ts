import pool from '../config/db';
import { AgenziaDTO, AgenziaSchema } from '../dto/AgenziaDTO';

export async function createAgenziaDB(data: Omit<AgenziaDTO, 'idAgenzia' | 'attiva'> & { idAmministratore: number }): Promise<AgenziaDTO> {
  const result = await pool.query(
    `INSERT INTO Agenzia (Nome, IdAmministratore, Attiva)
     VALUES ($1, $2, TRUE)
     RETURNING *`,
    [data.nome, data.idAmministratore]
  );
  return mapRowToAgenzia(result.rows[0]);
}

export async function getAgenzieDB(): Promise<AgenziaDTO[]> {
  const result = await pool.query('SELECT * FROM Agenzia ORDER BY Nome ASC');
  return result.rows.map(mapRowToAgenzia);
}

export async function getAgenziaById(idAgenzia: number): Promise<AgenziaDTO | null> {
  const result = await pool.query('SELECT * FROM Agenzia WHERE IdAgenzia = $1', [idAgenzia]);
  return result.rows[0] ? mapRowToAgenzia(result.rows[0]) : null;
}

export const updateAgenziaDB = async (idAgenzia: number, fields: Partial<AgenziaDTO>): Promise<AgenziaDTO> => {
  const allowedFields = new Set<keyof AgenziaDTO>(['nome', 'attiva']);
  const safeFields = Object.keys(fields).filter(f => allowedFields.has(f as keyof AgenziaDTO));

  if (!safeFields.length) throw new Error('Nessun campo valido da aggiornare');

  const setClause = safeFields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
  const values = safeFields.map(f => (fields as any)[f]);
  values.push(idAgenzia);

  const result = await pool.query(
    `UPDATE Agenzia SET ${setClause} WHERE IdAgenzia = $${values.length} RETURNING *`,
    values
  );

  return mapRowToAgenzia(result.rows[0]);
};

export async function getAgenziaByAdminId(idAmministratore: number): Promise<AgenziaDTO | null> {
  const result = await pool.query(
    'SELECT * FROM Agenzia WHERE IdAmministratore = $1 LIMIT 1',
    [idAmministratore]
  );
  return result.rows[0] ? mapRowToAgenzia(result.rows[0]) : null;
}

export async function checkAdminExists(idAmministratore: number): Promise<boolean> {
  const result = await pool.query(
    'SELECT IdUtente FROM Utente WHERE IdUtente = $1 AND Ruolo = $2',
    [idAmministratore, 'AmministratoreAgenzia']
  );
  return result.rows.length > 0;
};

// Mappatura DB → DTO
function mapRowToAgenzia(row: any): AgenziaDTO {
  return AgenziaSchema.parse({
    idAgenzia: row.idagenzia,
    nome: row.nome,
    idAmministratore: row.idamministratore,
    attiva: row.attiva,
  });
}