import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/authMiddleware';
import * as UtenteDAO from '../dao/UtenteDAO';
import { UtenteSchema } from '../dto/UtenteDTO';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Registrazione cliente
export async function register(req: Request, res: Response) {
const parsed = UtenteSchema.omit({
  idUtente: true,
  ruolo: true,
  dataCreazione: true,
  passwordHash: true
})
.extend({ password: z.string().min(6) }) 
.safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const { nome, cognome, email, password } = parsed.data;

  try {
    if (await UtenteDAO.checkEmailExists(email)) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    const user = await UtenteDAO.createCliente({ nome, cognome, email, password });
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
    if (!user || !user.passwordHash) return res.status(400).json({ error: 'Credenziali non valide' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Credenziali non valide' });

    const token = generateToken({ id: user.idUtente, ruolo: user.ruolo });
    res.json({ token, user: { id: user.idUtente, nome: user.nome, ruolo: user.ruolo } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il login' });
  }
}

// Profilo utente corrente
export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await UtenteDAO.getUtenteById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    res.json({ id: user.idUtente, nome: user.nome, ruolo: user.ruolo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero del profilo' });
  }
}

// Creazione agente
export async function createAgent(req: AuthRequest, res: Response) {
  const parsed = UtenteSchema.omit({
    idUtente: true,
    ruolo: true,
    dataCreazione: true,
    passwordHash: true
  })
    .extend({
      password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
      idAgenzia: z.number().int()
    })
    .safeParse(req.body);

  if (!parsed.success)
    return res.status(400).json({ error: parsed.error });

  try {
    const { nome, cognome, email, password, idAgenzia } = parsed.data;

    if (await UtenteDAO.checkEmailExists(email))
      return res.status(400).json({ error: "Email già registrata" });

    const agent = await UtenteDAO.createAgent({
      nome,
      cognome,
      email,
      password,
      idAgenzia
    });

    res.status(201).json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Errore durante la creazione dell'agente"
    });
  }
}

// Creazione supporto
export async function createSupport(req: AuthRequest, res: Response) {
  const parsed = UtenteSchema.omit({
    idUtente: true,
    ruolo: true,
    dataCreazione: true,
    passwordHash: true
  })
    .extend({ password: z.string().min(6, "La password deve avere almeno 6 caratteri") })
    .safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    if (await UtenteDAO.checkEmailExists(parsed.data.email))
      return res.status(400).json({ error: 'Email già registrata' });

    const support = await UtenteDAO.createSupport(parsed.data);
    res.status(201).json(support);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'utente di supporto' });
  }
}

// Cambio password
export async function changePassword(req: AuthRequest, res: Response) {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Vecchia e nuova password obbligatorie' });
  }

  try {
    const user = await UtenteDAO.getUtenteById(req.user.id);
    if (!user || !user.passwordHash)
      return res.status(404).json({ error: 'Utente non trovato' });

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Vecchia password non corretta' });

    await UtenteDAO.changePassword(req.user.id, newPassword);
    res.json({ message: 'Password aggiornata con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della password' });
  }
}
