import pool from '../config/db';
import { OAuthAccountDTO } from '../dto/OAuthAccountDTO';

export async function getByProviderId(provider: string, providerUserId: string): Promise<OAuthAccountDTO | null> {
  const result = await pool.query(
    `SELECT * FROM OAuthAccount WHERE provider = $1 AND providerUserId = $2`,
    [provider, providerUserId]
  );
  return result.rows[0] || null;
}

export async function createOAuth(data: Omit<OAuthAccountDTO, 'idOAuth' | 'dataCollegamento'>): Promise<OAuthAccountDTO> {
  const result = await pool.query(
    `INSERT INTO OAuthAccount (idUtente, provider, providerUserId, email, accessToken, refreshToken)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.idUtente, data.provider, data.providerUserId, data.email, data.accessToken, data.refreshToken]
  );
  return result.rows[0];
}
