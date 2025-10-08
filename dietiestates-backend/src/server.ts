import express from 'express';
import initDb from './config/initDb';
import pool from './config/db';
import authRoutes from './routes/auth';
import immobileRoutes from './routes/immobileRoutes';
import offertaRoutes from './routes/offertaRoutes';
import agenziaRoutes from './routes/agenziaRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware per parse JSON
app.use(express.json());

// Rotte autenticazione
app.use('/auth', authRoutes);

// Rotte immobili
app.use('/immobili', immobileRoutes);

app.use('/search', immobileRoutes);

app.use('/offerte', offertaRoutes);

app.use('/agenzie', agenziaRoutes);

// Endpoint di test
app.get('/', async (req, res) => {
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
    console.log('Database pronto ');
    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Errore durante l’inizializzazione del database:', err);
    process.exit(1);
  });
