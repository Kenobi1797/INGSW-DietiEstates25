import express from 'express';
import { createAgenzia, getAgenzie } from '../controllers/agenziaController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Creazione agenzia (solo admin)
router.post('/', authMiddleware, roleMiddleware('AmministratoreAgenzia'), createAgenzia);

// Lista agenzie (qualsiasi utente loggato)
router.get('/', authMiddleware, getAgenzie);

export default router;
