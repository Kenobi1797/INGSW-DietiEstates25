-- ==========================
-- TABELLE PRINCIPALI
-- ==========================

CREATE TABLE Utente (
    IdUtente SERIAL PRIMARY KEY,
    Nome VARCHAR(50) NOT NULL,
    Cognome VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash TEXT, 
    Ruolo VARCHAR(30) NOT NULL CHECK (Ruolo IN ('AmministratoreAgenzia', 'Supporto', 'Agente', 'Cliente')),
    DataCreazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IdAgenzia INT REFERENCES Agenzia(IdAgenzia) ON DELETE SET NULL
);

CREATE TABLE OAuthAccount (
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

CREATE TABLE Agenzia (
    IdAgenzia SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    IdAmministratore INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    Attiva BOOLEAN DEFAULT TRUE
);

CREATE TABLE Immobile (
    IdImmobile SERIAL PRIMARY KEY,
    IdAgente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    IdAgenzia INT NOT NULL REFERENCES Agenzia(IdAgenzia) ON DELETE CASCADE,
    Titolo VARCHAR(150) NOT NULL,
    Descrizione TEXT,
    Prezzo NUMERIC(12,2) NOT NULL CHECK (Prezzo >= 0),
    Dimensioni NUMERIC(8,2) CHECK (Dimensioni > 0),
    Indirizzo VARCHAR(200) NOT NULL,
    Comune VARCHAR(100) NOT NULL, 
    Provincia VARCHAR(50),
    Regione VARCHAR(50),
    CAP VARCHAR(10),
    NumeroStanze INT CHECK (NumeroStanze >= 1),
    NumeroBagni INT CHECK (NumeroBagni >= 1),
    Piano INT,
    Ascensore BOOLEAN DEFAULT FALSE,
    Balcone BOOLEAN DEFAULT FALSE,
    Terrazzo BOOLEAN DEFAULT FALSE,
    Giardino BOOLEAN DEFAULT FALSE,
    PostoAuto BOOLEAN DEFAULT FALSE,
    Cantina BOOLEAN DEFAULT FALSE,
    ClasseEnergetica VARCHAR(5) CHECK (ClasseEnergetica IN ('A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G')),
    Tipologia VARCHAR(20) NOT NULL CHECK (Tipologia IN ('Vendita', 'Affitto')),
    Latitudine DECIMAL(10,8) NOT NULL,
    Longitudine DECIMAL(11,8) NOT NULL,
    FotoUrls TEXT[],
    DataCreazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Venduto BOOLEAN DEFAULT FALSE,
    DataVendita TIMESTAMP
);

CREATE TABLE ServizioVicino (
    IdServizio SERIAL PRIMARY KEY,
    IdImmobile INT NOT NULL REFERENCES Immobile(IdImmobile) ON DELETE CASCADE,
    Tipo VARCHAR(50) NOT NULL CHECK (Tipo IN ('Scuola', 'Parco', 'TrasportoPubblico', 'Ospedale', 'Supermercato', 'Farmacia', 'Banca')),
    Nome VARCHAR(200),  
    Distanza NUMERIC(6,2), 
    Indirizzo VARCHAR(200),
    DataVerifica TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    VerificaAutomatica BOOLEAN DEFAULT TRUE  
);

CREATE TABLE Offerta (
    IdOfferta SERIAL PRIMARY KEY,
    IdImmobile INT NOT NULL REFERENCES Immobile(IdImmobile) ON DELETE CASCADE,
    IdUtente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    PrezzoOfferto NUMERIC(12,2) NOT NULL CHECK (PrezzoOfferto >= 0),
    Stato VARCHAR(20) NOT NULL CHECK (Stato IN ('InAttesa', 'Accettata', 'Rifiutata', 'Controproposta', 'Ritirata')),
    DataOfferta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DataScadenza TIMESTAMP,  
    Note TEXT,  
    OffertaManuale BOOLEAN DEFAULT FALSE,  
    IdOffertaOriginale INT REFERENCES Offerta(IdOfferta),  
    UNIQUE(IdImmobile, IdUtente, Stato) DEFERRABLE INITIALLY DEFERRED
);