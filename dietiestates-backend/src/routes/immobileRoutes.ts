import express from 'express';
import { createImmobile, searchImmobili, getImmobileById, getMyImmobili } from '../controllers/immobileController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Creazione immobile (solo agenti/admin)  
router.post(
  '/',
  authMiddleware,
  roleMiddleware('Agente', 'AmministratoreAgenzia', 'SupportAdmin'),
  createImmobile
);

// Ricerca immobili (solo utenti registrati)
router.get('/search', searchImmobili);   

// Immobili dell'agente autenticato
router.get('/miei', authMiddleware, roleMiddleware('Agente', 'AmministratoreAgenzia'), getMyImmobili);

// Dettaglio immobile (solo utenti registrati)
router.get('/:idImmobile', getImmobileById);

export default router;
