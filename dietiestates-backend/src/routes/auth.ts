import express from 'express';
import { register, login, createAgent, changePassword, createSupport } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);

// Rotta protetta: cambia password (qualsiasi utente loggato)
router.put('/change-password', authMiddleware, changePassword);

// Rotta protetta: crea agente (solo admin/supporto)
router.post(
  '/create-agent',
  authMiddleware,
  roleMiddleware('AmministratoreAgenzia', 'Supporto'),
  createAgent
);

// Rotta protetta: crea supporto (solo admin)
router.post(
  '/create-support',
  authMiddleware,
  roleMiddleware('AmministratoreAgenzia'),
  createSupport
);

export default router;
