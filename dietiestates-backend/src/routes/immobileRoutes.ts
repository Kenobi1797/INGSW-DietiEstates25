import express from 'express';
import { createImmobile, searchImmobili } from '../controllers/immobileController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Creazione immobile (solo agenti/admin)  
router.post(
  '/',
  authMiddleware,
  roleMiddleware('Agente', 'AmministratoreAgenzia'),  // anche i supportadmin?
  createImmobile
);

// Ricerca immobili (solo utenti registrati)
router.get('/search', authMiddleware, searchImmobili);             // serve autenticazione ?

export default router;
