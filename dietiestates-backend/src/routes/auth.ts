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
  const mode = req.query.mode === 'signup' ? 'signup' : 'login';
  const authOptions: Record<string, unknown> = {
    scope: ['profile', 'email'],
    session: false,
    state: mode,
  };

  // In registrazione forziamo scelta account/consenso; in login lasciamo accesso rapido.
  if (mode === 'signup') {
    authOptions.prompt = 'select_account consent';
    authOptions.accessType = 'offline';
  }

  passport.authenticate('google', authOptions)(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!googleEnabled) return res.status(503).json({ error: 'Google OAuth non configurato' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const mode = req.query.state === 'signup' ? 'signup' : 'login';
    const fallbackPath = mode === 'signup' ? '/signup' : '/login';

    passport.authenticate('google', { session: false }, (err: unknown, user: unknown, info: { code?: string } | undefined) => {
      if (err) {
        return res.redirect(`${frontendUrl}${fallbackPath}?oauth=failed`);
      }

      if (!user) {
        if (info?.code === 'already_registered') {
          return res.redirect(`${frontendUrl}/login?oauth=already_registered`);
        }
        if (info?.code === 'not_registered') {
          return res.redirect(`${frontendUrl}/signup?oauth=not_registered`);
        }
        return res.redirect(`${frontendUrl}${fallbackPath}?oauth=failed`);
      }

      const oauthResult = user as OAuthResult;
      if (!oauthResult?.token || !oauthResult?.user) {
        return res.redirect(`${frontendUrl}${fallbackPath}?oauth=failed`);
      }

      return res.redirect(`${frontendUrl}/google-callback?token=${oauthResult.token}`);
    })(req, res, next);
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
