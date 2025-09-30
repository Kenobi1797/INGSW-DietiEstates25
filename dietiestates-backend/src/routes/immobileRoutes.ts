import express from 'express';
import { createImmobile } from '../controllers/immobileController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Solo agenti e amministratori possono creare immobili
router.post(
  '/',
  authMiddleware,
  roleMiddleware('Agente', 'AmministratoreAgenzia'),
  createImmobile
);

export default router;
