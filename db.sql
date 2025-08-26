-- ==========================
-- TABELLE PRINCIPALI
-- ==========================

CREATE TABLE Utente (
    IdUtente SERIAL PRIMARY KEY,
    Nome VARCHAR(50) NOT NULL,
    Cognome VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,
    Ruolo VARCHAR(30) NOT NULL CHECK (Ruolo IN ('AmministratoreAgenzia', 'Supporto', 'Agente', 'Cliente'))
   , PasswordModificata BOOLEAN DEFAULT FALSE 
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
    Indirizzo VARCHAR(200),
    IdAmministratore INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE
);

CREATE TABLE Immobile (
    IdImmobile SERIAL PRIMARY KEY,
    IdAgente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    Titolo VARCHAR(150) NOT NULL,
    Descrizione TEXT,
    Prezzo NUMERIC(12,2) NOT NULL CHECK (Prezzo >= 0),
    Dimensioni NUMERIC(8,2),
    Indirizzo VARCHAR(200),
    NumeroStanze INT CHECK (NumeroStanze >= 0),
    Piano INT,
    Ascensore BOOLEAN DEFAULT FALSE,
    ClasseEnergetica VARCHAR(5),
    ServiziAggiuntivi TEXT,
    Tipologia VARCHAR(20) NOT NULL CHECK (Tipologia IN ('Vendita', 'Affitto')),
    Latitudine DECIMAL(10,8),
    Longitudine DECIMAL(11,8),
    DataCreazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE FotoImmobile (
    IdFoto SERIAL PRIMARY KEY,
    IdImmobile INT NOT NULL REFERENCES Immobile(IdImmobile) ON DELETE CASCADE,
    UrlFoto TEXT NOT NULL
);

CREATE TABLE ServizioVicino (
    IdServizio SERIAL PRIMARY KEY,
    IdImmobile INT NOT NULL REFERENCES Immobile(IdImmobile) ON DELETE CASCADE,
    Tipo VARCHAR(50) NOT NULL CHECK (Tipo IN ('Scuola', 'Parco', 'TrasportoPubblico'))
);

CREATE TABLE Offerta (
    IdOfferta SERIAL PRIMARY KEY,
    IdImmobile INT NOT NULL REFERENCES Immobile(IdImmobile) ON DELETE CASCADE,
    IdCliente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    IdAgente INT NOT NULL REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    PrezzoOfferto NUMERIC(12,2) NOT NULL CHECK (PrezzoOfferto >= 0),
    Stato VARCHAR(20) NOT NULL CHECK (Stato IN ('InAttesa', 'Accettata', 'Rifiutata', 'Controproposta')),
    DataOfferta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);