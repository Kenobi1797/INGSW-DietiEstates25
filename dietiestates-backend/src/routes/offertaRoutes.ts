import express from 'express';
import {
  createOfferta,
  createManualOfferta,
  getOffertePerImmobile,
  getOffertePerUtente,
  getOffertePerAgente,
  updateOfferta,
  ritiraOfferta
} from '../controllers/offertaController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Creazione offerta (cliente)
router.post('/', authMiddleware, roleMiddleware('Cliente'), createOfferta);

// Creazione offerta manuale (agente/admin)
router.post('/manual', authMiddleware, roleMiddleware('Agente', 'AmministratoreAgenzia'), createManualOfferta);

// Storico offerte immobile (agente/admin)
router.get('/immobile/:idImmobile', authMiddleware, roleMiddleware('Agente', 'AmministratoreAgenzia'), getOffertePerImmobile);

// Storico offerte utente (cliente)
router.get('/utente', authMiddleware, roleMiddleware('Cliente'), getOffertePerUtente);

// Offerte per agente (tutte le offerte sugli immobili dell'agente)
router.get('/agente', authMiddleware, roleMiddleware('Agente', 'AmministratoreAgenzia'), getOffertePerAgente);

// Ritiro offerta (solo il cliente proprietario)
router.patch('/:idOfferta/ritira', authMiddleware, roleMiddleware('Cliente'), ritiraOfferta);

// Aggiornamento stato offerta (solo agente/admin)
router.put('/:idOfferta', authMiddleware, roleMiddleware('Agente', 'AmministratoreAgenzia'), updateOfferta);

export default router;
