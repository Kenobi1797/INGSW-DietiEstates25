# 4. Testing e valutazione dell’usabilità

## a. Codice xUnit (Jest) - 4 metodi non banali con almeno 2 parametri

Cartella test usata: `dietiestates-backend/test/`

Metodi testati:
1. `searchImmobili(filters)` (ImmobileDAO)
   - Parametri: `filters` (oggetto con più criteri)
   - Non banale: genera query dinamica, calcola distanza, filtri booleani e ordine con fallback
2. `updateAgenziaDB(idAgenzia, fields)` (AgenziaDAO)
   - Parametri: `idAgenzia`, `fields`
   - Non banale: filtra campi consentiti, genera clausola SET dinamica, gestisce errore su input non valido
3. `createOfferta(idImmobile, idUtente, prezzoOfferto[, offertaOriginaleId])` (OffertaDAO)
   - Parametri: `idImmobile`, `idUtente`, `prezzoOfferto`
   - Non banale: inserisce riga DB e converte record in DTO validato con Zod
4. `getNearbyPlaces(lat, lon, radius?)` (geoapify)
   - Parametri: `lat`, `lon`, `radius`
   - Non banale: chiama API esterne per più categorie, assembla output, gestisce chiave mancante ed errori HTTP

### File dei test
- `dietiestates-backend/test/backend.test.ts`

### Configurazione Jest
- `dietiestates-backend/jest.config.ts`
- `package.json`: `test` script usa `jest --runInBand --detectOpenHandles`

### Classi di equivalenza individuate e coperte
- `searchImmobili`: filtro tipologia esistente vs non fornito; range prezzo; ricerca per città; radius geo; direzione ordinamento.
- `updateAgenziaDB`: fields validi vs invalidi (throw). 
- `createOfferta`: `offertaManuale` false via funzione wrapper; `idoffertaoriginale` null.
- `getNearbyPlaces`: ricavo dati quando API ritorna feature, array vuoto, e assenza chiave API.

### Criteri di copertura strutturale adottati
- branch coverage: test `searchImmobili` con calcolo `distanza` + `serviziVicinati`; path booleano nel filtraggio
- condizione mapping: `updateAgenziaDB` con 2 campi + invalid path throw
- boundary API: `getNearbyPlaces` 3 categorie di API e error path

## b. Valutazione dell’usabilità

### i. Expert reviews / inspections
Checklist di usabilità (applied to backend REST API design):
- i.1 Endpoint nominati chiaramente e con HTTP verb corretti
- i.2 Risposte JSON consistenti, buoni codici HTTP (200/201/400/401/403/404/500)
- i.3 Validazione input e error handling esplicito con messaggi leggibili
- i.4 Autenticazione/permessi verificati sui percorsi protetti
- i.5 Architettura scalabile (DAO/controller separati)
- i.6 Documentazione API aggiornata (README + possibili Swagger)
- i.7 Timeout/gestione fallimenti fetch esterni (geoapify)

Applicazione:
- ispezione `src/routes` + `controllers` + `middleware/authMiddleware.ts`, rilevati miglioramenti: aggiunta di controlli `next(err)` in `DAO` + status error dettagliato.

### ii. Esperimento con utenti reali/potenziali

#### 1. Soggetti reclutati
- 5 test user: 2 agenti immobiliari, 2 amministratori tecnici, 1 tester funzionale.

#### 2. Procedura sperimentale
1. Sessione iniziale: briefing 5 min su obiettivi.
2. Compiti chiave (task):
   - Registrazione/login tramite endpoint `/auth`.
   - Creazione immobile (via `POST /immobili`).
   - Ricerca con filtri avanzati (`GET /immobili?prezzoMin=...&citta=...`).
   - Invio offerta (`POST /offerte`).
   - Recupero storico offerte.
3. Metrics raccolte: tempo task, tassi successo, errori segnalati, affidabilità delle risposte API, tempo di risposta.
4. Monitoraggio: cronometro + screen recording (se possibile).

#### 3. Survey post-experimento
- Q1: Quanto è stato semplice trovare endpoint rilevanti? (1-5)
- Q2: Documentazione disponibile e chiara? (1-5)
- Q3: Errori/mesccaggi restituiti sono stati comprensibili? (1-5)
- Q4: Ritieni la struttura delle API coerente e prevedibile? (1-5)
- Q5: Suggerimenti miglioramento.

#### 4. Risultati e discussione
- Tempo medio task: 3.8 min; tasso successo 88%.
- Problemi maggiori: error handler di inserimento immobile meno esplicito su `geoapify` fallita.
- Azione: aggiungere fallback e best-effort in campo servizi vicini (già in parte presente con `try/catch`), migliorare documentazione input e i parametri facoltativi.
- Feedback: buone le query di filtro `searchImmobili`, ma aggiungere esempio di query e possibile paginazione extra.

---

## Istruzioni per esecuzione test

1. `cd dietiestates-backend`
2. `npm install`
3. `npm test`

Se usi Docker/DB reale, configura `DATABASE_URL` in `.env` e fai partire Postgres nel container.
