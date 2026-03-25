import express from 'express';
import { createImmobile, searchImmobili, getImmobileById } from '../controllers/immobileController';
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
router.get('/search', authMiddleware, searchImmobili);   

// Dettaglio immobile (solo utenti registrati)
router.get('/:idImmobile', authMiddleware, getImmobileById);

export default router;
