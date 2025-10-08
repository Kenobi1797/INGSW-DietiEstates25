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
      agenteId: req.user.id,
      titolo, descrizione, prezzo, dimensioni, indirizzo,
      numeroStanze, numeroBagni, piano, ascensore, balcone,
      terrazzo, giardino, postoAuto, cantina, portineria,
      climatizzazione, riscaldamento, classeEnergetica, tipologia,
      latitudine, longitudine, fotoUrls
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
    const filters = req.query;
    const immobili = await ImmobileDAO.searchImmobili(filters);
    res.json(immobili);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la ricerca degli immobili' });
  }
}
