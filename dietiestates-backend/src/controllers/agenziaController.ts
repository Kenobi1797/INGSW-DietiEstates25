import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Creazione nuova agenzia (solo admin)
export async function createAgenzia(req: AuthRequest, res: Response) {
  const { nome, idAmministratore } = req.body;

  if (!nome || !idAmministratore) {
    return res.status(400).json({ error: 'Nome e idAmministratore sono obbligatori' });
  }

  try {
    // Controlla che l'amministratore esista
    const adminCheck = await pool.query(
      'SELECT IdUtente FROM Utente WHERE IdUtente = $1 AND Ruolo = $2',
      [idAmministratore, 'AmministratoreAgenzia']
    );
    if (adminCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Amministratore non trovato' });
    }

    // Inserimento agenzia
    const result = await pool.query(
      'INSERT INTO Agenzia (Nome, IdAmministratore, Attiva) VALUES ($1, $2, TRUE) RETURNING *',
      [nome, idAmministratore]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'agenzia' });
  }
}

// Recupero agenzie (tutti gli utenti loggati possono vedere)
export async function getAgenzie(req: Request, res: Response) {
  try {
    const result = await pool.query('SELECT * FROM Agenzia ORDER BY Nome ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero delle agenzie' });
  }
}

// src/controllers/agenziaController.ts
export async function updateAgenzia(req: AuthRequest, res: Response) {
  const { idAgenzia } = req.params;
  const { nome, attiva } = req.body;

  if (!nome && attiva === undefined) {
    return res.status(400).json({ error: 'Almeno un campo da aggiornare è obbligatorio' });
  }

  try {
    // Controlla che l'agenzia esista
    const { rows } = await pool.query('SELECT * FROM Agenzia WHERE IdAgenzia = $1', [idAgenzia]);
    if (rows.length === 0) return res.status(404).json({ error: 'Agenzia non trovata' });

    // Costruisci query dinamica
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (nome) { fields.push(`Nome = $${i++}`); values.push(nome); }
    if (attiva !== undefined) { fields.push(`Attiva = $${i++}`); values.push(attiva); }

    values.push(idAgenzia);
    const query = `UPDATE Agenzia SET ${fields.join(', ')} WHERE IdAgenzia = $${i} RETURNING *`;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'agenzia' });
  }
}
