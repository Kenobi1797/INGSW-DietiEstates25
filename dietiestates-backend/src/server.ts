import express from 'express';
import initDb from './config/initDb'; // la funzione che crea le tabelle
import pool from './config/db';       // il pool di connessione
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);

app.use(express.json());

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

// Inizializza il database prima di avviare il server
initDb()
  .then(() => {
    console.log('Database pronto ✅');
    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Errore durante l’inizializzazione del database:', err);
    process.exit(1);
  });
