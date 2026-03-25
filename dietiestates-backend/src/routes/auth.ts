import express from 'express';
import passport from 'passport';
import { register, login, me, createAgent, changePassword, createSupport } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import { authRateLimit } from '../middleware/rateLimitMiddleware';

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

    // Redirect al frontend con token per login con Google.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/google-callback?token=${oauthResult.token}`);
  }
);

// Rotte pubbliche (con rate limiting anti-brute-force)
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);

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
