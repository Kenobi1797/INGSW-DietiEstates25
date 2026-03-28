import express from 'express';
import { uploadFoto, createImmobile, searchImmobili, getImmobileById, getMyImmobili } from '../controllers/immobileController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = express.Router();

// Upload immagini (agente/admin) → restituisce array di URL
router.post(
  '/upload-foto',
  authMiddleware,
  roleMiddleware('Agente', 'Supporto', 'AmministratoreAgenzia'),
  uploadMiddleware,
  uploadFoto
);

// Creazione immobile (solo agenti/admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('Agente', 'Supporto', 'AmministratoreAgenzia'),
  createImmobile
);

// Ricerca immobili
router.get('/search', searchImmobili);

// Immobili dell'agente autenticato
router.get('/miei', authMiddleware, roleMiddleware('Agente', 'Supporto', 'AmministratoreAgenzia'), getMyImmobili);

// Dettaglio immobile
router.get('/:idImmobile', getImmobileById);

export default router;
