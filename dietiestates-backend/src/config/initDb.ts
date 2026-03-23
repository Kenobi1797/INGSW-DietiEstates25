import pool from './db';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function initDb(): Promise<void> {
  // Crea le tabelle base
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Utente (
     IdUtente SERIAL PRIMARY KEY,
     Nome VARCHAR(50) NOT NULL,
     Cognome VARCHAR(50) NOT NULL,
     Email VARCHAR(100) UNIQUE NOT NULL,
     PasswordHash TEXT, 
     Ruolo VARCHAR(30) NOT NULL CHECK (Ruolo IN ('AmministratoreAgenzia', 'Supporto', 'Agente', 'Cliente')),
     DataCreazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS OAuthAccount (
     IdOAuth SERIAL PRIMARY KEY,
     IdUtente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
     Provider VARCHAR(30) NOT NULL CHECK (Provider IN ('Google', 'Facebook', 'GitHub')),
     ProviderUserId VARCHAR(100) NOT NULL,
     Email VARCHAR(100),
     AccessToken TEXT,
     RefreshToken TEXT,
     DataCollegamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE (Provider, ProviderUserId)
    );

    CREATE TABLE IF NOT EXISTS Agenzia (
     IdAgenzia SERIAL PRIMARY KEY,
     Nome VARCHAR(100) NOT NULL,
     IdAmministratore INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
     Attiva BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS Immobile (
     IdImmobile SERIAL PRIMARY KEY,
     IdAgente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
     Titolo VARCHAR(150) NOT NULL,
     Descrizione TEXT,
     Prezzo NUMERIC(12,2) NOT NULL CHECK (Prezzo >= 0),
     Dimensioni NUMERIC(8,2) CHECK (Dimensioni > 0),
     Indirizzo VARCHAR(200) NOT NULL,
     NumeroStanze INT CHECK (NumeroStanze >= 1),
     NumeroBagni INT CHECK (NumeroBagni >= 1),
     Piano INT,
     Ascensore BOOLEAN DEFAULT FALSE,
     Balcone BOOLEAN DEFAULT FALSE,
     Terrazzo BOOLEAN DEFAULT FALSE,
     Giardino BOOLEAN DEFAULT FALSE,
     PostoAuto BOOLEAN DEFAULT FALSE,
     Cantina BOOLEAN DEFAULT FALSE,
     Portineria BOOLEAN DEFAULT FALSE,
     Climatizzazione BOOLEAN DEFAULT FALSE,
     Riscaldamento VARCHAR(30) CHECK (Riscaldamento IN ('Autonomo', 'Centralizzato', 'Pompa di calore', 'Altro')),
     ScuoleVicine BOOLEAN DEFAULT FALSE,
     ParchiVicini BOOLEAN DEFAULT FALSE,
     TrasportiPubbliciVicini BOOLEAN DEFAULT FALSE,
     ClasseEnergetica VARCHAR(5) CHECK (ClasseEnergetica IN ('A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G')),
     Tipologia VARCHAR(20) NOT NULL CHECK (Tipologia IN ('Vendita', 'Affitto')),
     Latitudine DECIMAL(10,8) NOT NULL,
     Longitudine DECIMAL(11,8) NOT NULL,
     FotoUrls TEXT[],
     DataCreazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     Venduto BOOLEAN DEFAULT FALSE,
     DataVendita TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Offerta (
     IdOfferta SERIAL PRIMARY KEY,
     IdImmobile INT NOT NULL REFERENCES Immobile(IdImmobile) ON DELETE CASCADE,
     IdUtente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
     PrezzoOfferto NUMERIC(12,2) NOT NULL CHECK (PrezzoOfferto >= 0),
     Stato VARCHAR(20) NOT NULL CHECK (Stato IN ('InAttesa', 'Accettata', 'Rifiutata', 'Controproposta', 'Ritirata')),
     DataOfferta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     OffertaManuale BOOLEAN DEFAULT FALSE,  
     IdOffertaOriginale INT REFERENCES Offerta(IdOfferta)
    );
  `);

  if (process.env.NODE_ENV === 'development') {
    console.log('Database inizializzato (tabelle create se non esistono)');
  }

  await pool.query(`ALTER TABLE Utente ADD COLUMN IF NOT EXISTS IdAgenzia INT REFERENCES Agenzia(IdAgenzia) ON DELETE SET NULL;`);

  await createDefaultAdmin();
  await createDefaultAgency();

}

async function createDefaultAdmin(): Promise<void> {
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@dietiestates.com';
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';

  try {
    const { rows } = await pool.query(
      'SELECT IdUtente FROM Utente WHERE Email = $1',
      [defaultEmail]
    );

    if (rows.length === 0) {
      // Crea l'utente admin
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      await pool.query(
        `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo)
         VALUES ($1, $2, $3, $4, $5)`,
        ['Admin', 'Sistema', defaultEmail, passwordHash, 'AmministratoreAgenzia']
      );

      console.log(`Utente amministratore creato con email "${defaultEmail}". Cambia la password al primo accesso!`);
    } else {
      console.log(`Utente amministratore già esistente: "${defaultEmail}"`);
    }
  } catch (error) {
    console.error('Errore durante la creazione/verifica dell\'admin predefinito:', error);
    throw error;
  }
}

async function createDefaultAgency(): Promise<void> {
  const defaultAgencyName = process.env.DEFAULT_AGENCY_NAME || 'DietiEstates';
  const adminId = 1; // ID dell'amministratore predefinito

  try {
    const { rows: agencyRows } = await pool.query(
      'SELECT IdAgenzia FROM Agenzia WHERE IdAmministratore = $1',
      [adminId]
    );

    if (agencyRows.length === 0) {
      await pool.query(
        'INSERT INTO Agenzia (Nome, IdAmministratore, Attiva) VALUES ($1, $2, $3)',
        [defaultAgencyName, adminId, true]
      );
      console.log(`Agenzia predefinita "${defaultAgencyName}" creata per l'admin`);
    } else {
      console.log(`Agenzia predefinita già esistente`);
    }
  } catch (error) {
    console.error(' Errore durante la creazione/verifica dell\'agenzia predefinita:', error);
    throw error;
  }
}

export default initDb;
