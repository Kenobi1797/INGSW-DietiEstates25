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
  await createDemoData();

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

async function createDemoData(): Promise<void> {
  try {
    const getOrCreateUser = async (
      nome: string,
      cognome: string,
      email: string,
      passwordPlain: string,
      ruolo: 'AmministratoreAgenzia' | 'Supporto' | 'Agente' | 'Cliente'
    ): Promise<number> => {
      const { rows: existing } = await pool.query('SELECT IdUtente FROM Utente WHERE Email = $1', [email]);
      if (existing.length > 0) return existing[0].idutente;

      const passwordHash = await bcrypt.hash(passwordPlain, 10);
      const { rows: inserted } = await pool.query(
        `INSERT INTO Utente (Nome, Cognome, Email, PasswordHash, Ruolo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING IdUtente`,
        [nome, cognome, email, passwordHash, ruolo]
      );
      return inserted[0].idutente;
    };

    const { rows: agencyRows } = await pool.query('SELECT IdAgenzia FROM Agenzia LIMIT 1');
    const idAgenzia = agencyRows.length > 0 ? agencyRows[0].idagenzia : null;

    const agenteMarioId = await getOrCreateUser('Mario', 'Rossi', 'agente@dietiestates.com', 'Agente123!', 'Agente');
    const agenteLuciaId = await getOrCreateUser('Lucia', 'Bianchi', 'agente2@dietiestates.com', 'Agente123!', 'Agente');
    const clienteAnnaId = await getOrCreateUser('Anna', 'Verdi', 'cliente1@dietiestates.com', 'Cliente123!', 'Cliente');
    const clientePaoloId = await getOrCreateUser('Paolo', 'Neri', 'cliente2@dietiestates.com', 'Cliente123!', 'Cliente');
    const supportoSofiaId = await getOrCreateUser('Sofia', 'Gialli', 'supporto@dietiestates.com', 'Supporto123!', 'Supporto');

    if (idAgenzia) {
      await pool.query(
        `UPDATE Utente
         SET IdAgenzia = $1
         WHERE IdUtente = ANY($2::int[]) AND (IdAgenzia IS NULL OR IdAgenzia <> $1)`,
        [idAgenzia, [agenteMarioId, agenteLuciaId, supportoSofiaId]]
      );
    }

    const estateImagesA = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ];

    const estateImagesB = [
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ];

    const { rows: immobileRows } = await pool.query('SELECT IdImmobile, Titolo FROM Immobile ORDER BY IdImmobile ASC');
    const immobiliMap = new Map<string, number>(immobileRows.map((r) => [r.titolo, r.idimmobile]));

    const ensureImmobile = async (
      idAgente: number,
      titolo: string,
      descrizione: string,
      prezzo: number,
      dimensioni: number,
      indirizzo: string,
      numeroStanze: number,
      numeroBagni: number,
      piano: number,
      ascensore: boolean,
      balcone: boolean,
      terrazzo: boolean,
      giardino: boolean,
      postoAuto: boolean,
      cantina: boolean,
      portineria: boolean,
      climatizzazione: boolean,
      riscaldamento: string,
      scuoleVicine: boolean,
      parchiVicini: boolean,
      trasportiPubbliciVicini: boolean,
      classeEnergetica: string,
      tipologia: 'Vendita' | 'Affitto',
      latitudine: number,
      longitudine: number,
      fotoUrls: string[]
    ): Promise<number> => {
      if (immobiliMap.has(titolo)) return immobiliMap.get(titolo)!;

      const { rows } = await pool.query(
        `INSERT INTO Immobile (IdAgente,Titolo,Descrizione,Prezzo,Dimensioni,Indirizzo,NumeroStanze,NumeroBagni,Piano,Ascensore,Balcone,Terrazzo,Giardino,PostoAuto,Cantina,Portineria,Climatizzazione,Riscaldamento,ScuoleVicine,ParchiVicini,TrasportiPubbliciVicini,ClasseEnergetica,Tipologia,Latitudine,Longitudine,FotoUrls)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
         RETURNING IdImmobile`,
        [
          idAgente,
          titolo,
          descrizione,
          prezzo,
          dimensioni,
          indirizzo,
          numeroStanze,
          numeroBagni,
          piano,
          ascensore,
          balcone,
          terrazzo,
          giardino,
          postoAuto,
          cantina,
          portineria,
          climatizzazione,
          riscaldamento,
          scuoleVicine,
          parchiVicini,
          trasportiPubbliciVicini,
          classeEnergetica,
          tipologia,
          latitudine,
          longitudine,
          fotoUrls
        ]
      );
      const idImmobile = rows[0].idimmobile;
      immobiliMap.set(titolo, idImmobile);
      return idImmobile;
    };

    const immobileAtticoId = await ensureImmobile(
      agenteMarioId,
      'Attico con terrazzo',
      'Attico con vista panoramica e terrazzo di 50mq',
      520000,
      140,
      'Via Toledo 34, Napoli',
      5,
      3,
      6,
      true,
      true,
      true,
      false,
      false,
      true,
      false,
      true,
      'Centralizzato',
      true,
      true,
      true,
      'A',
      'Vendita',
      40.8522,
      14.2681,
      estateImagesA
    );

    const immobileGiardinoId = await ensureImmobile(
      agenteMarioId,
      'Appartamento con giardino privato',
      'Appartamento in residenza con giardino privato e parcheggio',
      280000,
      95,
      'Via delle Gardenie 21, Caserta',
      4,
      2,
      1,
      false,
      true,
      false,
      true,
      true,
      false,
      false,
      false,
      'Autonomo',
      true,
      true,
      false,
      'B',
      'Vendita',
      41.0737,
      14.3349,
      estateImagesB
    );

    const immobileAffittoId = await ensureImmobile(
      agenteLuciaId,
      'Bilocale in centro storico',
      'Bilocale ristrutturato ideale per professionisti, vicino metro e servizi',
      900,
      62,
      'Via Roma 12, Napoli',
      2,
      1,
      3,
      true,
      true,
      false,
      false,
      false,
      false,
      true,
      true,
      'Autonomo',
      true,
      false,
      true,
      'C',
      'Affitto',
      40.8495,
      14.2582,
      estateImagesA
    );

    const immobileTrilocaleId = await ensureImmobile(
      agenteLuciaId,
      'Trilocale con posto auto',
      'Trilocale luminoso in zona residenziale con posto auto coperto',
      345000,
      110,
      'Viale Europa 87, Salerno',
      3,
      2,
      2,
      true,
      true,
      false,
      false,
      true,
      true,
      false,
      true,
      'Pompa di calore',
      false,
      true,
      true,
      'A+',
      'Vendita',
      40.6824,
      14.7681,
      estateImagesB
    );

    const { rows: offerteRows } = await pool.query('SELECT IdOfferta FROM Offerta LIMIT 1');
    if (offerteRows.length === 0) {
      const { rows: inAttesaRows } = await pool.query(
        `INSERT INTO Offerta (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale)
         VALUES ($1, $2, $3, 'InAttesa', false)
         RETURNING IdOfferta`,
        [immobileAtticoId, clienteAnnaId, 495000]
      );

      const offertaOriginaleId = inAttesaRows[0].idofferta;

      await pool.query(
        `INSERT INTO Offerta (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale)
         VALUES ($1, $2, $3, 'InAttesa', false)`,
        [immobileGiardinoId, clientePaoloId, 275000]
      );

      await pool.query(
        `INSERT INTO Offerta (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale)
         VALUES ($1, $2, $3, 'Rifiutata', false)`,
        [immobileTrilocaleId, clienteAnnaId, 320000]
      );

      await pool.query(
        `INSERT INTO Offerta (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale, IdOffertaOriginale)
         VALUES ($1, $2, $3, 'Controproposta', false, $4)`,
        [immobileAtticoId, clienteAnnaId, 505000, offertaOriginaleId]
      );

      await pool.query(
        `INSERT INTO Offerta (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale)
         VALUES ($1, $2, $3, 'Ritirata', false)`,
        [immobileAffittoId, clientePaoloId, 850]
      );

      await pool.query(
        `INSERT INTO Offerta (IdImmobile, IdUtente, PrezzoOfferto, Stato, OffertaManuale)
         VALUES ($1, $2, $3, 'InAttesa', true)`,
        [immobileAffittoId, clienteAnnaId, 890]
      );
    }

    console.log('Dati dimostrativi completi (utenti, agenti, immobili e offerte) pronti.');
  } catch (error) {
    console.error('Errore creazione dati dimostrativi:', error);
    throw error;
  }
}

export default initDb;
