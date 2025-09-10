# UC2 – Caricamento Immobili

| Campo | Contenuto |
|-------|-----------|
| **Titolo** | Caricamento nuovi immobili |
| **Attore primario** | Agente immobiliare |
| **Stakeholder / interessati** | Utenti, Agente immobiliare, Amministratore |
| **Precondizioni** | Agente autenticato; immobile da inserire pronto |
| **Postcondizioni** | Immobile salvato nel database con posizione e categorie corrette |
| **Scenario principale / Flusso base** | 1. Agente apre pagina “Nuovo immobile” <br> 2. Inserisce dati: foto, descrizione, prezzo, stanze, piano, ascensore, servizi, classe energetica <br> 3. Seleziona categoria (vendita/affitto) <br> 4. Posiziona l’immobile sulla mappa <br> 5. Sistema salva immobile |
| **Flussi alternativi / eccezioni** | - Dati mancanti → messaggio di errore <br> - Immagini troppo grandi → ridimensionamento o avviso |
| **Requisiti speciali** | Integrazione con mappa interattiva (Google Maps); supporto futuri affitti brevi/case vacanze |

**Mock-up:** Inserire schermata form caricamento immobile con mappa.

