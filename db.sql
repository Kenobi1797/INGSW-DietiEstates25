-- ==========================
-- TABELLE PRINCIPALI
-- ==========================

CREATE TABLE Utente (
    IdUtente SERIAL PRIMARY KEY,
    Nome CHARACTER VARYING(50) NOT NULL,
    Cognome CHARACTER VARYING(50) NOT NULL,
    Email CHARACTER VARYING(100) UNIQUE NOT NULL,
    PasswordHash TEXT, 
    Ruolo CHARACTER VARYING(30) NOT NULL CHECK (Ruolo IN ('AmministratoreAgenzia', 'Supporto', 'Agente', 'Cliente')),
    DataCreazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE OAuthAccount (
    IdOAuth SERIAL PRIMARY KEY,
    IdUtente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    Provider CHARACTER VARYING(30) NOT NULL CHECK (Provider IN ('Google', 'Facebook', 'GitHub')),
    ProviderUserId CHARACTER VARYING(100) NOT NULL,
    Email CHARACTER VARYING(100),
    AccessToken TEXT,
    RefreshToken TEXT,
    DataCollegamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (Provider, ProviderUserId)
);

CREATE TABLE Agenzia (
    IdAgenzia SERIAL PRIMARY KEY,
    Nome CHARACTER VARYING(100) NOT NULL,
    IdAmministratore INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    Attiva BOOLEAN DEFAULT TRUE
);

-- Collegamento Utente → Agenzia (aggiunto dopo Agenzia per evitare dipendenza circolare)
-- Agenti e Supporto appartengono a un'agenzia; Cliente e AmministratoreAgenzia hanno NULL
ALTER TABLE Utente
    ADD COLUMN IdAgenzia INT REFERENCES Agenzia(IdAgenzia) ON DELETE SET NULL;

CREATE TABLE Immobile (
    IdImmobile SERIAL PRIMARY KEY,
    IdAgente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    Titolo CHARACTER VARYING(150) NOT NULL,
    Descrizione TEXT,
    Prezzo NUMERIC(12,2) NOT NULL CHECK (Prezzo >= 0),
    Dimensioni NUMERIC(8,2) CHECK (Dimensioni > 0),
    Indirizzo CHARACTER VARYING(200) NOT NULL,
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
    Riscaldamento CHARACTER VARYING(30) CHECK (Riscaldamento IN ('Autonomo', 'Centralizzato', 'Pompa di calore', 'Altro')),
    ScuoleVicine BOOLEAN DEFAULT FALSE,
    ParchiVicini BOOLEAN DEFAULT FALSE,
    TrasportiPubbliciVicini BOOLEAN DEFAULT FALSE,
    ClasseEnergetica CHARACTER VARYING(5) CHECK (ClasseEnergetica IN ('A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G')),
    Tipologia CHARACTER VARYING(20) NOT NULL CHECK (Tipologia IN ('Vendita', 'Affitto')),
    Latitudine DECIMAL(10,8) NOT NULL,
    Longitudine DECIMAL(11,8) NOT NULL,
    FotoUrls TEXT[],
    DataCreazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Venduto BOOLEAN DEFAULT FALSE,
    DataVendita TIMESTAMP
);

CREATE TABLE Offerta (
    IdOfferta SERIAL PRIMARY KEY,
    IdImmobile INT NOT NULL REFERENCES Immobile(IdImmobile) ON DELETE CASCADE,
    IdUtente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    PrezzoOfferto NUMERIC(12,2) NOT NULL CHECK (PrezzoOfferto >= 0),
    Stato CHARACTER VARYING(20) NOT NULL CHECK (Stato IN ('InAttesa', 'Accettata', 'Rifiutata', 'Controproposta', 'Ritirata')),
    DataOfferta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    OffertaManuale BOOLEAN DEFAULT FALSE,  
    IdOffertaOriginale INT REFERENCES Offerta(IdOfferta)
);