import express from 'express';
import {
  createOfferta,
  createManualOfferta,
  getOffertePerImmobile,
  getOffertePerUtente
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

export default router;
