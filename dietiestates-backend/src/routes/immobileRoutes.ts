import express from 'express';
import { createImmobile, searchImmobili } from '../controllers/immobileController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Creazione immobile (solo agenti/admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('Agente', 'AmministratoreAgenzia'),
  createImmobile
);

// Ricerca immobili (pubblica)
router.get('/search', searchImmobili);

export default router;
