import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione ottimizzata del pool con valori sensati per performance
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
};

const pool = new Pool(poolConfig);

// Gestione degli errori del pool
pool.on('error', (err) => {
  console.error('Errore inaspettato nel pool del database:', err);
  process.exit(-1);
});

export default pool;
