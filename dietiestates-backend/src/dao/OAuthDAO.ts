import pool from '../config/db';
import { OAuthAccountDTO } from '../dto/OAuthAccountDTO';

function mapRowToOAuth(row: Record<string, unknown>): OAuthAccountDTO {
  return {
    idOAuth: row.idoauth as number,
    idUtente: row.idutente as number,
    provider: row.provider as OAuthAccountDTO['provider'],
    providerUserId: row.provideruserid as string,
    email: row.email as string,
    accessToken: row.accesstoken as string | undefined,
    refreshToken: row.refreshtoken as string | undefined,
    dataCollegamento: row.datacollegamento as Date | undefined,
  };
}

export async function getByProviderId(provider: string, providerUserId: string): Promise<OAuthAccountDTO | null> {
  const result = await pool.query(
    `SELECT * FROM OAuthAccount WHERE provider = $1 AND providerUserId = $2`,
    [provider, providerUserId]
  );
  return result.rows[0] ? mapRowToOAuth(result.rows[0]) : null;
}

export async function createOAuth(data: Omit<OAuthAccountDTO, 'idOAuth' | 'dataCollegamento'>): Promise<OAuthAccountDTO> {
  const result = await pool.query(
    `INSERT INTO OAuthAccount (idUtente, provider, providerUserId, email, accessToken, refreshToken)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.idUtente, data.provider, data.providerUserId, data.email, data.accessToken, data.refreshToken]
  );
  return mapRowToOAuth(result.rows[0]);
}
