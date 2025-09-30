import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/authMiddleware';

// Registrazione cliente
export async function register(req: Request, res: Response) {
  const { nome, cognome, email, password } = req.body;
  try {
    const exists = await pool.query('SELECT IdUtente FROM Utente WHERE Email = $1', [email]);
    if (exists.rows.length) return res.status(400).json({ error: 'Email già registrata' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo) 
       VALUES ($1,$2,$3,$4,$5) RETURNING IdUtente, Nome, Cognome, Email, Ruolo, DataCreazione`,
      [nome, cognome, email, passwordHash, 'Cliente']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
}

// Login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM Utente WHERE Email = $1', [email]);
    if (!result.rows.length) return res.status(400).json({ error: 'Credenziali non valide' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.passwordhash);
    if (!match) return res.status(400).json({ error: 'Credenziali non valide' });

    const token = generateToken({ id: user.idutente, ruolo: user.ruolo });
    res.json({ token, user: { id: user.idutente, nome: user.nome, ruolo: user.ruolo } });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il login' });
  }
}

// Creazione agente (solo admin/supporto)
export async function createAgent(req: AuthRequest, res: Response) {
  const { nome, cognome, email, password } = req.body;

  if (!nome || !cognome || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    const exists = await pool.query('SELECT IdUtente FROM Utente WHERE Email = $1', [email]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'Email già registrata' });

    const passwordHash = await bcrypt.hash(password, 10);

    const creatorId = req.user.id;
    const { rows: agencyRows } = await pool.query(
      'SELECT IdAgenzia FROM Agenzia WHERE IdAmministratore = $1',
      [creatorId]
    );

    if (agencyRows.length === 0) return res.status(400).json({ error: 'Agenzia non trovata per l\'utente' });

    const idAgenzia = agencyRows[0].idagenzia;

    const result = await pool.query(
      `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo, IdAgenzia)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING IdUtente, Nome, Cognome, Email, Ruolo, IdAgenzia, DataCreazione`,
      [nome, cognome, email, passwordHash, 'Agente', idAgenzia]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'agente' });
  }
}

export async function createSupport(req: AuthRequest, res: Response) {
  const { nome, cognome, email, password } = req.body;

  if (!nome || !cognome || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    const exists = await pool.query('SELECT IdUtente FROM Utente WHERE Email = $1', [email]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'Email già registrata' });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING IdUtente, Nome, Cognome, Email, Ruolo, DataCreazione`,
      [nome, cognome, email, passwordHash, 'Supporto']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'utente di supporto' });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Vecchia e nuova password obbligatorie' });
  }

  try {
    const result = await pool.query('SELECT PasswordHash FROM Utente WHERE IdUtente = $1', [userId]);
    const user = result.rows[0];

    const match = await bcrypt.compare(oldPassword, user.passwordhash);
    if (!match) return res.status(400).json({ error: 'Vecchia password non corretta' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE Utente SET PasswordHash = $1 WHERE IdUtente = $2', [newHash, userId]);

    res.json({ message: 'Password aggiornata con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della password' });
  }
}
