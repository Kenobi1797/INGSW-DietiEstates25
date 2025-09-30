import express from 'express';
import { register, login, createAgent } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);

// Rotta protetta: crea agente (solo admin/supporto)
router.post(
  '/create-agent',
  authMiddleware,
  roleMiddleware('AmministratoreAgenzia', 'Supporto'),
  createAgent
);

export default router;
