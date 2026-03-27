import { AuthRequest } from '../middleware/authMiddleware';
import { Response, Request } from 'express';
import * as ImmobileDAO from '../dao/ImmobileDAO';
import * as OffertaDAO from '../dao/OffertaDAO';
import pool from '../config/db';

// Handler upload foto
export async function uploadFoto(req: AuthRequest, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const urls = files.map((f) => `${baseUrl}/uploads/${f.filename}`);
  return res.json({ urls });
}

// Creazione nuovo immobile
export async function createImmobile(req: AuthRequest, res: Response) {
  const {
    titolo, descrizione, prezzo, dimensioni, indirizzo,
    numeroStanze, numeroBagni, piano, ascensore, balcone,
    terrazzo, giardino, postoAuto, cantina, portineria,
    climatizzazione, riscaldamento, classeEnergetica, tipologia,
    latitudine, longitudine, fotoUrls
  } = req.body;

  if (!titolo || !prezzo || !indirizzo || !tipologia || !latitudine || !longitudine) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {
    const immobile = await ImmobileDAO.createImmobile({
      idAgente: req.user.id,
      titolo, descrizione, prezzo, dimensioni, indirizzo,
      numeroStanze, numeroBagni, piano, ascensore, balcone,
      terrazzo, giardino, postoAuto, cantina, portineria,
      climatizzazione, riscaldamento, classeEnergetica, tipologia,
      latitudine, longitudine, fotoUrls,
    });

    res.status(201).json(immobile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'immobile' });
  }
}

// Ricerca avanzata immobili
export async function searchImmobili(req: Request, res: Response) {
  try {
    const hasCoordinates = Boolean(req.query.latitudine || req.query.lat) && Boolean(req.query.longitudine || req.query.lon);
    const filters = {
      ...req.query,
      tipologia: req.query.tipologia || (req.query.type === 'vendita' ? 'Vendita' : req.query.type === 'affitto' ? 'Affitto' : undefined),
      latitudine: req.query.latitudine || req.query.lat,
      longitudine: req.query.longitudine || req.query.lon,
      // Se abbiamo coordinate, evitiamo il filtro testuale completo sull'indirizzo
      // per non restringere eccessivamente i risultati.
      citta: req.query.citta || (!hasCoordinates ? req.query.address : undefined)
    };
    const immobili = await ImmobileDAO.searchImmobili(filters);
    res.json(immobili);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la ricerca degli immobili' });
  }
}

export async function getImmobileById(req: Request, res: Response) {
  try {
    const idImmobile = Number(req.params.idImmobile);
    if (!Number.isInteger(idImmobile) || idImmobile <= 0) {
      return res.status(400).json({ error: 'Id immobile non valido' });
    }

    const immobile = await ImmobileDAO.getImmobileById(idImmobile);
    if (!immobile) {
      return res.status(404).json({ error: 'Immobile non trovato' });
    }

    return res.json(immobile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Errore durante il recupero dell\'immobile' });
  }
}

// Immobili dell'agente autenticato
// Per AmministratoreAgenzia restituisce tutti gli immobili degli agenti della sua agenzia
export async function getMyImmobili(req: AuthRequest, res: Response) {
  try {
    if (req.user.ruolo === 'AmministratoreAgenzia') {
      const { rows } = await pool.query(
        'SELECT IdAgenzia FROM Utente WHERE IdUtente = $1',
        [req.user.id]
      );
      const idAgenzia = rows[0]?.idagenzia;
      if (!idAgenzia) return res.json([]);
      const immobili = await ImmobileDAO.getImmobiliByAgenzia(idAgenzia);
      return res.json(immobili);
    }
    const immobili = await ImmobileDAO.getImmobiliByAgente(req.user.id);
    return res.json(immobili);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Errore durante il recupero degli immobili' });
  }
}

// Segna un immobile in affitto come nuovamente disponibile (sfittato)
export async function sfittaImmobile(req: AuthRequest, res: Response) {
  try {
    const idImmobile = Number(req.params.idImmobile);
    if (!Number.isInteger(idImmobile) || idImmobile <= 0) {
      return res.status(400).json({ error: 'Id immobile non valido' });
    }
    const immobile = await ImmobileDAO.getImmobileById(idImmobile);
    if (!immobile) return res.status(404).json({ error: 'Immobile non trovato' });
    if (immobile.tipologia !== 'Affitto') {
      return res.status(400).json({ error: "L'operazione è valida solo per immobili in Affitto" });
    }
    if (!immobile.affittato) {
      return res.status(400).json({ error: "L'immobile non risulta attualmente affittato" });
    }
    await OffertaDAO.markImmobileAsDisponibile(idImmobile);
    return res.json({ message: 'Immobile reso nuovamente disponibile' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Errore durante l'aggiornamento dell'immobile" });
  }
}
