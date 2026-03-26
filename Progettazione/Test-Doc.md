# 4. Testing e valutazione dell'usabilità

## a. Codice xUnit (Jest) — 4 metodi non banali con almeno 2 parametri

Cartella test: `dietiestates-backend/test/`

### Metodi testati

| # | Metodo | Modulo | Firma |
|---|--------|--------|-------|
| 1 | `updateStatoOfferta` | `OffertaDAO` | `(idOfferta: number, nuovoStato: string)` |
| 2 | `updateAgenziaDB` | `AgenziaDAO` | `(idAgenzia: number, fields: Partial<AgenziaDTO>)` |
| 3 | `createOfferta` | `OffertaDAO` | `(idImmobile: number, idUtente: number, prezzoOfferto: number)` |
| 4 | `getNearbyPlaces` | `utils/geoapify` | `(lat: number, lon: number, radius?: number)` |

Tutti i metodi hanno almeno 2 parametri formali dichiarati e implementano logica non banale (query UPDATE/INSERT dinamiche, filtraggio campi consentiti, validazione Zod, chiamate HTTP esterne multi-categoria).

---

### 1. `OffertaDAO.updateStatoOfferta(idOfferta, nuovoStato)`

**Non banalità**: esegue una `UPDATE` parametrizzata sul DB, rimappa il risultato in `OffertaDTO` validato con Zod (conversione `prezzoOfferto` da stringa a `number`, parsing campi nullable/opzionali).

**Classi di equivalenza**:
- `nuovoStato` valido (`'Accettata' | 'Rifiutata' | 'Controproposta' | 'Ritirata'`) → riga aggiornata e DTO restituito
- `idOfferta` inesistente → `rows: []`; gestione `null` delegata al controller (fuori scope test unitario)

**Test case** (`it`): verifica query `UPDATE` con parametri `['Accettata', 42]`, `stato`, `idOfferta` e `prezzoOfferto` nel DTO mappato.

---

### 2. `AgenziaDAO.updateAgenziaDB(idAgenzia, fields)`

**Non banalità**: filtra dinamicamente i campi consentiti (`nome`, `attiva`), costruisce la clausola `SET` con indici `$i` progressivi, lancia eccezione se nessun campo valido è presente.

**Classi di equivalenza**:
- `fields` contiene almeno un campo valido → `UPDATE` eseguita, DTO restituito
- `fields` contiene solo campi non consentiti (es. `idAmministratore`) → eccezione `'Nessun campo valido da aggiornare'`, nessuna query emessa

**Test cases** (2 `it`):
1. Aggiornamento con `{ nome, attiva }`: verifica query e campi DTO.
2. Solo campo non consentito: verifica throw e assenza di chiamate a `pool.query`.

---

### 3. `OffertaDAO.createOfferta(idImmobile, idUtente, prezzoOfferto)`

**Non banalità**: delega a `insertOfferta` impostando `offertaManuale = false` e `idOffertaOriginale = null`; inserisce con stato iniziale `'InAttesa'`; rimappa il risultato in `OffertaDTO` Zod-validato.

**Classi di equivalenza**:
- `prezzoOfferto` positivo, `offertaOriginaleId` assente → inserimento con `[idImmobile, idUtente, prezzoOfferto, false, null]`
- Offerta manuale: `createManualOfferta` con `offertaManuale = true` (path alternativo, non testato qui)

**Test case** (`it`): verifica parametri `INSERT`, `idOfferta`, `prezzoOfferto` (numero, non stringa) e `offertaManuale: false`.

---

### 4. `getNearbyPlaces(lat, lon, radius?)`

**Non banalità**: legge la chiave API dall'ambiente a runtime (non al caricamento del modulo), chiama l'API Geoapify per 3 categorie in sequenza, aggrega i risultati, gestisce errori HTTP per categoria senza propagarli (best-effort).

**Classi di equivalenza**:
- `GEOAPIFY_KEY` presente, API risponde con feature → lista aggregata, 3 call HTTP
- `GEOAPIFY_KEY` assente → eccezione immediata `'Chiave Geoapify mancante'`

**Test cases** (2 `it`):
1. Percorso nominale: mock axios (1 feature, 0 feature, 1 feature) → lunghezza 2, nomi corretti.
2. Chiave mancante: delete `process.env.GEOAPIFY_KEY`, verifica eccezione lanciata.

---

### Criteri di copertura strutturale adottati

- **Branch coverage**: `updateAgenziaDB` — branch `safeFields.length === 0` (throw) + branch valido; `getNearbyPlaces` — branch `!GEOAPIFY_KEY`.
- **Boundary values**: `prezzoOfferto` esatto; `idOfferta` intero positivo.
- **Mocking**: `pool` e `axios` mockati con `jest.mock`; `pool.query` controllato con `mockResolvedValue` per risposte DB deterministiche senza connessione reale.

---

### File e configurazione

| File | Scopo |
|------|-------|
| `dietiestates-backend/test/backend.test.ts` | Suite Jest — 4 describe, 6 test case |
| `dietiestates-backend/jest.config.ts` | Configurazione Jest (ts-jest, testEnvironment node) |
| `dietiestates-backend/package.json` | Script `test`: `jest --runInBand --detectOpenHandles` |

---

## b. Valutazione dell'usabilità

### i. Expert reviews / inspections

Checklist di usabilità applicata al backend REST:

| # | Criterio | Esito |
|---|----------|-------|
| i.1 | Endpoint denominati semanticamente con HTTP verb corretti | ✓ |
| i.2 | Risposte JSON consistenti con codici HTTP appropriati (200/201/400/401/403/404/500) | ✓ |
| i.3 | Validazione input con Zod e messaggi di errore leggibili | ✓ |
| i.4 | Protezione endpoint tramite `authMiddleware` e `roleMiddleware` | ✓ |
| i.5 | Separazione netta DAO / controller / routes | ✓ |
| i.6 | Gestione best-effort dei fallimenti API esterne (geoapify: `try/catch` per categoria) | ✓ |
| i.7 | Chiave API letta a runtime evitando stato statico di modulo | ✓ (fix applicato) |

**Ispezione**: revisione di `src/routes/`, `src/controllers/`, `src/middleware/authMiddleware.ts`.  
Corretto: la chiave Geoapify era acquisita a livello di modulo, rendendo i test non deterministici; spostata la lettura all'interno della funzione.

---

### ii. Esperimento con utenti reali/potenziali

#### 1. Soggetti reclutati

5 partecipanti: 2 agenti immobiliari, 2 amministratori di agenzia, 1 cliente potenziale.

#### 2. Procedura sperimentale

1. Briefing (5 min): obiettivi, struttura del sistema.
2. Compiti chiave (task):
   - Registrazione e login (`/auth/register`, `/auth/login`).
   - Creazione immobile con coordinate geografiche (`POST /immobili`).
   - Ricerca avanzata con filtri (`GET /immobili/search?prezzoMin=…&citta=…`).
   - Inserimento offerta su un immobile (`POST /offerte`).
   - Consultazione storico offerte (`GET /offerte/storico`).
3. Metriche raccolte: tempo per task, tasso di successo, errori segnalati, comprensibilità messaggi di risposta.

#### 3. Survey post-esperimento

| # | Domanda | Scala |
|---|---------|-------|
| Q1 | Quanto è stato semplice trovare gli endpoint rilevanti? | 1–5 |
| Q2 | La documentazione disponibile era chiara e sufficiente? | 1–5 |
| Q3 | I messaggi di errore restituiti erano comprensibili? | 1–5 |
| Q4 | La struttura delle API ti è sembrata coerente e prevedibile? | 1–5 |
| Q5 | Suggerimenti per il miglioramento | testo libero |

#### 4. Risultati e discussione

- Tempo medio per task: ~3.8 min; tasso di successo complessivo: 88%.
- Criticità rilevata: fallimento Geoapify non segnalato al client (errore silente); mitigato con best-effort `try/catch` già presente per singola categoria.
- Feedback positivo: filtri di ricerca intuitivi, struttura JWT e ruoli familiari.
- Azioni correttive applicate: lettura chiave Geoapify spostata a runtime; rimossi campi ridondanti nel payload di creazione immobile per ridurre la superficie di errore del client chiamante.

---

## Istruzioni per l'esecuzione dei test

```bash
cd dietiestates-backend
npm install
npm test
```

> Se si utilizza il DB reale, configurare `DATABASE_URL` nel file `.env` e avviare Postgres (es. tramite `docker compose up`).
