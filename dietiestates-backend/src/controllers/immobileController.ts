import { AuthRequest } from '../middleware/authMiddleware';
import { Response, Request } from 'express';
import * as ImmobileDAO from '../dao/ImmobileDAO';

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
      idImmobile: 0,
      scuoleVicine: false,
      parchiVicini: false,
      trasportiPubbliciVicini: false,
      dataCreazione: new Date(),
      venduto: false
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

export async function getMyImmobili(req: AuthRequest, res: Response) {
  try {
    const immobili = await ImmobileDAO.getImmobiliByAgente(req.user.id);
    return res.json(immobili);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Errore durante il recupero degli immobili dell\'agente' });
  }
}
