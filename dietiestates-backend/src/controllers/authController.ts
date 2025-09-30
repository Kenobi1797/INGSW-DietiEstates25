import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

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
