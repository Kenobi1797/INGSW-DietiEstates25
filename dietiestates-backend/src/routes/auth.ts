import express from 'express';
import passport from 'passport';
import { register, login, me, createAgent, changePassword, createSupport } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rotte autenticazione Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const oauthResult = req.user as any;
    if (!oauthResult || !oauthResult.token || !oauthResult.user) {
      return res.status(400).json({ error: 'Errore login Google' });
    }

    // Se si vuole gestire il redirect frontend, si può usare:
    // res.redirect(`${process.env.FRONTEND_URL}/google-callback?token=${oauthResult.token}`);

    // Risposta JSON con token e user
    res.json({ token: oauthResult.token, user: oauthResult.user });
  }
);

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);

// Rotta protetta: ottieni utenti correnti con id, nome, ruolo
router.get('/me', authMiddleware, me);

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
