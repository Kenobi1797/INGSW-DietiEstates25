import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request } from 'express';
import * as UtenteDAO from '../dao/UtenteDAO';
import * as OAuthDAO from '../dao/OAuthDAO';
import { generateToken } from '../utils/jwt';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${backendUrl}/auth/google/callback`,
    passReqToCallback: true,
  },
  async (req: Request, accessToken, refreshToken, profile, done) => {
    try {
      const mode = req.query.state === 'signup' ? 'signup' : 'login';

      // Cerca l'account OAuth tramite providerUserId (Google ID univoco)
      const oauthAccount = await OAuthDAO.getByProviderId('Google', profile.id);

      let user;
      if (mode === 'signup') {
        if (oauthAccount) {
          return done(null, false, { code: 'already_registered' });
        }

        const email = profile.emails?.[0].value;
        if (!email) throw new Error('Email non disponibile dal profilo Google');

        user = await UtenteDAO.createCliente({
          nome: profile.name?.givenName || 'Sconosciuto',
          cognome: profile.name?.familyName || '',
          email,
          password: '', // nessuna password per account OAuth
        });

        await OAuthDAO.createOAuth({
          idUtente: user.idUtente!,
          provider: 'Google',
          providerUserId: profile.id,
          email,
          accessToken,
          refreshToken,
        });
      } else {
        if (!oauthAccount) {
          return done(null, false, { code: 'not_registered' });
        }

        user = await UtenteDAO.getUtenteById(oauthAccount.idUtente);
        if (!user) throw new Error('Utente collegato non trovato');
      }

      // Genera JWT
      const token = generateToken({ id: user.idUtente!, ruolo: user.ruolo, isOAuth: true });
      return done(null, { user, token });
    } catch (err) {
      return done(err as Error, undefined);
    }
  }
  ));
} else {
  console.warn('[passport] Google OAuth non configurato: le variabili GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET sono assenti.');
}

