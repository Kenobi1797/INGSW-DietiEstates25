import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotte base
app.get('/', (_, res) => {
  res.json({ message: 'Benvenuto in DietiEstates API' });
});

// Porta del server
const PORT = process.env['PORT'] || 5000;

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});