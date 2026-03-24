import express, { Request, Response } from 'express';
import initDb from './config/initDb';
import pool from './config/db';
import authRoutes from './routes/auth';
import immobileRoutes from './routes/immobileRoutes';
import offertaRoutes from './routes/offertaRoutes';
import agenziaRoutes from './routes/agenziaRoutes';
import { searchImmobili } from './controllers/immobileController';
import { authMiddleware } from './middleware/authMiddleware';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Creazione dell'app PRIMA di usarla
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware per parse JSON
app.use(express.json());

// Configurazione session
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);

// Configurazione Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      // Logica per trovare/creare utente nel DB
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// Rotte
app.use('/auth', authRoutes);
app.use('/immobili', immobileRoutes);
app.get('/search', authMiddleware, searchImmobili);
app.use('/offerte', offertaRoutes);
app.use('/agenzie', agenziaRoutes);

// Endpoint di test
app.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ serverTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel server' });
  }
});

// Inizializza il database e avvia il server
initDb()
  .then(() => {
    console.log('Database pronto');
    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Errore durante l’inizializzazione del database:', err);
    process.exit(1);
  });

export default app;
