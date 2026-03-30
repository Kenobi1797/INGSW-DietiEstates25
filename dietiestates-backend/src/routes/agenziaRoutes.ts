import express from 'express';
import { assignStaffToAgenzia, createAgenzia, getAgenzie, getAssignableStaff } from '../controllers/agenziaController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Creazione agenzia (solo admin)
router.post('/', authMiddleware, roleMiddleware('AmministratoreAgenzia'), createAgenzia);

// Lista agenzie (qualsiasi utente loggato)
router.get('/', authMiddleware, getAgenzie);

// Lista agenti/supporto assegnabili (solo admin/supporto)
router.get('/staff', authMiddleware, roleMiddleware('AmministratoreAgenzia', 'Supporto'), getAssignableStaff);

// Assegna agente/supporto a un'agenzia esistente (solo admin/supporto)
router.post('/assegna-staff', authMiddleware, roleMiddleware('AmministratoreAgenzia', 'Supporto'), assignStaffToAgenzia);

export default router;
