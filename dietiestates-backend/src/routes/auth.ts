import express from 'express';
import passport from 'passport';

interface OAuthResult {
  token: string;
  user: { id: number; nome: string; email: string; ruolo: string };
}
import { register, login, me, createAgent, changePassword, createSupport } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rotte autenticazione Google (solo se la strategy è configurata)
const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

router.get('/google', (req, res, next) => {
  if (!googleEnabled) return res.status(503).json({ error: 'Google OAuth non configurato' });
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!googleEnabled) return res.status(503).json({ error: 'Google OAuth non configurato' });
    passport.authenticate('google', { failureRedirect: '/' })(req, res, next);
  },
  (req, res) => {
    const oauthResult = req.user as OAuthResult | undefined;
    if (!oauthResult?.token || !oauthResult?.user) {
      return res.status(400).json({ error: 'Errore login Google' });
    }

    // Redirect al frontend con token per login con Google.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/google-callback?token=${oauthResult.token}`);
  }
);

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);

// Rotta protetta: ottieni utenti correnti con id, nome, ruolo
router.get('/me', authMiddleware, me);

// Rotta protetta: cambia password (solo amministratore agenzia)
router.put('/change-password', authMiddleware, roleMiddleware('AmministratoreAgenzia'), changePassword);

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
