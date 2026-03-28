import express from 'express';
import {
  createOfferta,
  createManualOfferta,
  getOffertePerImmobile,
  getOffertePerUtente,
  getOffertePerAgente,
  getStoricoOfferte,
  getControffertePerCliente,
  updateOfferta,
  rispondiControproposta
} from '../controllers/offertaController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Creazione offerta (cliente)
router.post('/', authMiddleware, roleMiddleware('Cliente'), createOfferta);

// Creazione offerta manuale (agente/admin)
router.post('/manual', authMiddleware, roleMiddleware('Agente', 'Supporto', 'AmministratoreAgenzia'), createManualOfferta);

// Storico offerte immobile (agente/admin)
router.get('/immobile/:idImmobile', authMiddleware, roleMiddleware('Agente', 'Supporto', 'AmministratoreAgenzia'), getOffertePerImmobile);

// Storico offerte utente (cliente)
router.get('/utente', authMiddleware, roleMiddleware('Cliente'), getOffertePerUtente);

// Storico offerte unificato — tutti i ruoli autenticati
router.get('/storico', authMiddleware, getStoricoOfferte);

// Offerte per agente (tutte le offerte sugli immobili dell'agente)
router.get('/agente', authMiddleware, roleMiddleware('Agente', 'Supporto', 'AmministratoreAgenzia'), getOffertePerAgente);

// Controfferte ricevute dal cliente
router.get('/controfferte', authMiddleware, roleMiddleware('Cliente'), getControffertePerCliente);

// Risposta del cliente a una controfferta
router.patch('/:idOfferta/rispondi', authMiddleware, roleMiddleware('Cliente'), rispondiControproposta);

// Aggiornamento stato offerta (solo agente/admin)
router.put('/:idOfferta', authMiddleware, roleMiddleware('Agente', 'Supporto', 'AmministratoreAgenzia'), updateOfferta);

export default router;
