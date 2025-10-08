import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/authMiddleware';
import * as UtenteDAO from '../dao/UtenteDAO';
import bcrypt from 'bcrypt';

// Registrazione cliente
export async function register(req: Request, res: Response) {
  const { nome, cognome, email, password } = req.body;
  try {
    if (await UtenteDAO.checkEmailExists(email)) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    const user = await UtenteDAO.createCliente(nome, cognome, email, password);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
}

// Login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await UtenteDAO.getUtenteByEmail(email);
    if (!user) return res.status(400).json({ error: 'Credenziali non valide' });

    const match = await bcrypt.compare(password, user.passwordhash);
    if (!match) return res.status(400).json({ error: 'Credenziali non valide' });

    const token = generateToken({ id: user.idutente, ruolo: user.ruolo });
    res.json({ token, user: { id: user.idutente, nome: user.nome, ruolo: user.ruolo } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il login' });
  }
}

// Creazione agente (solo admin/supporto)
export async function createAgent(req: AuthRequest, res: Response) {
  const { nome, cognome, email, password, idAgenzia } = req.body;
  if (!nome || !cognome || !email || !password || !idAgenzia) {
    return res.status(400).json({ error: 'Tutti i campi e idAgenzia sono obbligatori' });
  }

  try {
    if (await UtenteDAO.checkEmailExists(email)) return res.status(400).json({ error: 'Email già registrata' });

    const agent = await UtenteDAO.createAgent(nome, cognome, email, password, idAgenzia);
    res.status(201).json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'agente' });
  }
}

// Creazione supporto (solo admin)
export async function createSupport(req: AuthRequest, res: Response) {
  const { nome, cognome, email, password } = req.body;
  if (!nome || !cognome || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    if (await UtenteDAO.checkEmailExists(email)) return res.status(400).json({ error: 'Email già registrata' });

    const support = await UtenteDAO.createSupport(nome, cognome, email, password);
    res.status(201).json(support);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'utente di supporto' });
  }
}

// Cambio password
export async function changePassword(req: AuthRequest, res: Response) {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Vecchia e nuova password obbligatorie' });
  }

  try {
    const user = await UtenteDAO.getUtenteById(userId);
    const match = await bcrypt.compare(oldPassword, user.passwordhash);
    if (!match) return res.status(400).json({ error: 'Vecchia password non corretta' });

    await UtenteDAO.changePassword(userId, newPassword);
    res.json({ message: 'Password aggiornata con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della password' });
  }
}
