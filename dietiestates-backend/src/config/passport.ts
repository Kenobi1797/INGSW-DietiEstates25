import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as UtenteDAO from '../dao/UtenteDAO';
import * as OAuthDAO from '../dao/OAuthDAO';
import { generateToken } from '../utils/jwt';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Cerco se esiste un OAuthAccount per questo providerUserId
      let oauthAccount = await OAuthDAO.getByProviderId('Google', profile.id);

      let user;
      if (oauthAccount) {
        // Se esiste, prendo l'utente
        user = await UtenteDAO.getUtenteById(oauthAccount.idUtente);
        if (!user) throw new Error('Utente collegato non trovato');
      } else {
        const email = profile.emails?.[0].value;
        if (!email) throw new Error('Email non disponibile dal profilo Google');

        // Se esiste già un utente con questa email (registrato con password), lo colleghiamo
        let existingUser = await UtenteDAO.getUtenteByEmail(email);
        if (!existingUser) {
          existingUser = await UtenteDAO.createCliente({
            nome: profile.name?.givenName || 'Sconosciuto',
            cognome: profile.name?.familyName || '',
            email,
            password: '' // password vuota perché OAuth
          });
        }
        user = existingUser;

        // Creo l'associazione OAuth
        await OAuthDAO.createOAuth({
          idUtente: user.idUtente!,
          provider: 'Google',
          providerUserId: profile.id,
          email,
          accessToken,
          refreshToken
        });
      }

      // Genero JWT
      const token = generateToken({ id: user.idUtente!, ruolo: user.ruolo, isOAuth: true });
      return done(null, { user, token });
    } catch (err) {
      return done(err as Error, undefined);
    }
  }
));

