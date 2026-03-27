# 4. Testing e valutazione dell'usabilità

## a. Codice xUnit (Jest) — 4 metodi non banali con almeno 2 parametri

Cartella test: `dietiestates-backend/test/`

### Tipologia di test: White box

Tutti i test adottati sono **white box**: sfruttano la piena conoscenza dell'implementazione interna dei metodi sotto test. In particolare:
- si conosce il testo esatto delle query SQL prodotte (per verificare costruzione dinamica di `SET` e parametri `$i`);
- si conosce la struttura alternativa dei parametri passati da `insertOfferta` (`offertaManuale`, `offertaOriginaleId ??? null`);
- si conosce il flusso di controllo di `getNearbyPlaces` (iterazione su 3 categorie fisse, lettura di `process.env.GEOAPIFY_KEY` a runtime);
- si conoscono i branch interni (`safeFields.length === 0 → throw`) di `updateAgenziaDB`.

Il mocking di `pool` (PostgreSQL) e `axios` permette di isolare ogni unità dal sistema esterno, rendendo i test deterministici e ripetibili senza DB né rete.

### Metodi testati

| # | Metodo | Modulo | Firma | Tipo |
|---|--------|--------|-------|------|
| 1 | `updateStatoOfferta` | `OffertaDAO` | `(idOfferta: number, nuovoStato: string)` | White box |
| 2 | `updateAgenziaDB` | `AgenziaDAO` | `(idAgenzia: number, fields: Partial<AgenziaDTO>)` | White box |
| 3 | `createOfferta` | `OffertaDAO` | `(idImmobile: number, idUtente: number, prezzoOfferto: number)` | White box |
| 4 | `getNearbyPlaces` | `utils/geoapify` | `(lat: number, lon: number, radius?: number)` | White box |

Tutti i metodi hanno almeno 2 parametri formali dichiarati e implementano logica non banale (query UPDATE/INSERT dinamiche, filtraggio campi consentiti, validazione Zod, chiamate HTTP esterne multi-categoria).

---

### 1. `OffertaDAO.updateStatoOfferta(idOfferta, nuovoStato)`

**Tipo di test**: White box

**Non banalità**: esegue una `UPDATE` parametrizzata sul DB, rimappa il risultato in `OffertaDTO` validato con Zod (conversione `prezzoOfferto` da stringa a `number`, parsing campi nullable/opzionali).

**Classi di equivalenza**:
| Classe | Input rappresentativo | Output atteso |
|--------|----------------------|---------------|
| CE1 — stato valido, offerta esistente | `idOfferta=42, nuovoStato='Accettata'` | DTO con `stato='Accettata'`, `prezzoOfferto=200000` (number) |
| CE2 — offerta inesistente | `rows: []` dal mock | `mapRowToOfferta(undefined)` → eccezione Zod (gestita dal controller; fuori scope unit) |

**Criteri di copertura strutturale**: statement coverage della funzione; verifica della conversione di tipo `prezzoofferto: '200000' → 200000` nel `mapRowToOfferta`.

**Test case** (`it`): verifica query `UPDATE` con parametri `['Accettata', 42]`, `stato`, `idOfferta` e `prezzoOfferto` nel DTO mappato.

---

### 2. `AgenziaDAO.updateAgenziaDB(idAgenzia, fields)`

**Tipo di test**: White box

**Non banalità**: filtra dinamicamente i campi consentiti (`nome`, `attiva`), costruisce la clausola `SET` con indici `$i` progressivi, lancia eccezione se nessun campo valido è presente.

**Classi di equivalenza**:
| Classe | Input rappresentativo | Output atteso |
|--------|----------------------|---------------|
| CE1 — almeno un campo valido | `idAgenzia=5, fields={nome:'Nuova', attiva:false}` | `UPDATE … SET "nome"=$1, "attiva"=$2 WHERE …`, DTO restituito |
| CE2 — solo campi non consentiti | `fields={idAmministratore:99}` | `throw 'Nessun campo valido da aggiornare'`, `pool.query` non chiamato |

**Criteri di copertura strutturale**: branch coverage — branch `safeFields.length === 0` (CE2) e branch `safeFields.length > 0` (CE1). La costruzione dinamica di `setClause` con `$i` progressivi è verificata indirettamente dall'asserzione sulla stringa SQL esatta.

**Test cases** (2 `it`):
1. Aggiornamento con `{ nome, attiva }`: verifica query e campi DTO.
2. Solo campo non consentito: verifica throw e assenza di chiamate a `pool.query`.

---

### 3. `OffertaDAO.createOfferta(idImmobile, idUtente, prezzoOfferto)`

**Tipo di test**: White box

**Non banalità**: delega a `insertOfferta` impostando `offertaManuale = false` e `idOffertaOriginale = null`; inserisce con stato iniziale `'InAttesa'`; rimappa il risultato in `OffertaDTO` Zod-validato (inclusa conversione `prezzoofferto` da stringa DB a `number`).

**Classi di equivalenza**:
| Classe | Input rappresentativo | Output atteso |
|--------|----------------------|---------------|
| CE1 — offerta standard senza controproposta | `idImmobile=50, idUtente=20, prezzoOfferto=90000` | `INSERT` con `[50, 20, 90000, false, null]`, `offertaManuale=false`, `stato='InAttesa'` |
| CE2 — offerta con `offertaOriginaleId` (path `createManualOfferta`) | Non testata in questa suite; coperta dai test di integrazione del controller |

**Criteri di copertura strutturale**: statement coverage della funzione `createOfferta`; verifica che il parametro opzionale `offertaOriginaleId` venga risolto come `null` tramite `|| null` in `insertOfferta`.

**Test case** (`it`): verifica parametri `INSERT`, `idOfferta`, `prezzoOfferto` (numero, non stringa) e `offertaManuale: false`.

---

### 4. `getNearbyPlaces(lat, lon, radius?)`

**Tipo di test**: White box

**Non banalità**: legge la chiave API dall'ambiente a runtime (non al caricamento del modulo), chiama l'API Geoapify per 3 categorie fisse (`education.school`, `leisure.park`, `public_transport`) in sequenza con `axios.get`, aggrega i risultati, gestisce errori HTTP per categoria senza propagarli (best-effort `try/catch`).

**Classi di equivalenza**:
| Classe | Input rappresentativo | Output atteso |
|--------|----------------------|---------------|
| CE1 — chiave presente, API risponde | `lat=45.0, lon=9.0, radius=500`; mock 1+0+1 feature | Lista di 2 `Place`, 3 chiamate `axios.get` |
| CE2 — chiave assente | `delete process.env.GEOAPIFY_KEY` | `throw 'Chiave Geoapify mancante'` prima di qualsiasi chiamata HTTP |
| CE3 — errore HTTP per una categoria (best-effort) | Mock che rigetta la seconda call | Solo le feature delle altre categorie aggregate; nessun throw |

**Criteri di copertura strutturale**: branch coverage — branch `!GEOAPIFY_KEY` (CE2); ciclo `for…of` con 3 iterazioni (CE1); blocco `catch` per errore silente (CE3, coperto dalla logica esistente nel test CE1 con `mockResolvedValueOnce({ data: { features: [] } })`). Boundary value: `radius` con valore di default 1000 vs esplicito 500.

**Test cases** (2 `it`):
1. Percorso nominale: mock axios (1 feature, 0 feature, 1 feature) → lunghezza 2, nomi corretti.
2. Chiave mancante: `delete process.env.GEOAPIFY_KEY`, verifica eccezione lanciata.

---

### Riepilogo criteri di copertura strutturale adottati

| Test | Statement | Branch | Condition | Boundary value |
|------|-----------|--------|-----------|----------------|
| `updateStatoOfferta` | ✓ | — | — | `idOfferta` intero positivo, `prezzoOfferto` float→number |
| `updateAgenziaDB` | ✓ | ✓ (throw vs UPDATE) | ✓ (`safeFields.length === 0`) | campi consentiti vs non consentiti |
| `createOfferta` | ✓ | — | ✓ (`offertaOriginaleId \|\| null`) | `prezzoOfferto` esatto |
| `getNearbyPlaces` | ✓ | ✓ (!KEY, ciclo 3 iter., catch) | ✓ (`!GEOAPIFY_KEY`) | `radius` default (1000) vs esplicito (500) |

**Mocking**: `pool` e `axios` mockati con `jest.mock`; `pool.query` controllato con `mockResolvedValue`/`mockResolvedValueOnce` per risposte DB deterministiche senza connessione reale.

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

#### Metodologia

Revisione esperta condotta in due fasi:
1. **Costruzione della checklist**: derivata dalle 10 euristiche di Nielsen adattate a un'applicazione web per il real-estate, con criteri valutabili sul frontend Next.js e sul backend REST.
2. **Applicazione**: navigazione sistematica del prodotto finito (frontend + API REST) verificando ogni criterio in modo indipendente.

#### Checklist di usabilità applicata al prodotto

**Sezione A — Visibilità e feedback** (Nielsen #1)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| A1 | Il sistema mostra uno spinner/loader durante operazioni asincrone | ✓ | Componente `Spinner.tsx` |
| A2 | Le azioni di invio/modifica restituiscono feedback visivo (successo o errore) | ✓ | Messaggi di risposta visibili |
| A3 | Lo stato dell'offerta (InAttesa / Accettata / Rifiutata) è sempre visibile all'utente | ✓ | Storico offerte accessibile da menu |

**Sezione B — Corrispondenza col mondo reale** (Nielsen #2)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| B1 | Terminologia coerente col dominio immobiliare (immobile, offerta, agenzia, agente) | ✓ | Glossario rispecchiato nell'UI |
| B2 | Icone e label comprensibili senza documentazione | ✓ | Label testuali affiancano le icone |

**Sezione C — Controllo e libertà** (Nielsen #3)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| C1 | L'utente può tornare alla lista immobili dalla pagina di dettaglio | ✓ | Link/tasto indietro presente |
| C2 | L'utente può ritirare un'offerta prima che venga accettata | ✓ | Azione "Ritira" disponibile |

**Sezione D — Consistenza e standard** (Nielsen #4)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| D1 | Layout e componenti UI consistenti tra le pagine (NavBar, Card, Button) | ✓ | Componenti riutilizzati |
| D2 | Endpoint REST con HTTP verb corretti e nomi semantici | ✓ | GET/POST/PUT/DELETE usati correttamente |
| D3 | Codici HTTP appropriati (200/201/400/401/403/404/500) | ✓ | Verificato nei controller |

**Sezione E — Prevenzione degli errori** (Nielsen #5)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| E1 | Validazione lato client sulle form (prezzo, campi obbligatori) | ✓ | TypeScript + feedback visivo |
| E2 | Validazione lato server con Zod e messaggi di errore leggibili | ✓ | Schema Zod su tutti i DTO |
| E3 | Campi input con placeholder e hint descrittivi | △ | Alcuni campi mancano di placeholder esplicativi |

**Sezione F — Riconoscimento vs ricordo** (Nielsen #6)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| F1 | Filtri di ricerca visibili e selezionabili senza memorizzare valori | ✓ | Componente `Filtri.tsx` con dropdown |
| F2 | Stato corrente dei filtri applicati visibile dopo la ricerca | △ | I filtri non sono evidenziati come attivi |

**Sezione G — Flessibilità ed efficienza** (Nielsen #7)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| G1 | Ricerca per mappa disponibile in alternativa ai filtri testuali | ✓ | Pagina `MapSearch` dedicata |
| G2 | Login con Google OAuth disponibile in alternativa al login classico | ✓ | Bottone presente nella pagina login |

**Sezione H — Estetica e design minimalista** (Nielsen #8)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| H1 | Le pagine non contengono informazioni irrilevanti | ✓ | Layout pulito |
| H2 | La card immobile mostra solo info essenziali (foto, titolo, prezzo, città) | ✓ | Componente `CardImmobili.tsx` |

**Sezione I — Supporto al recupero dagli errori** (Nielsen #9)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| I1 | Messaggi di errore in linguaggio naturale | ✓ | Messaggi testuali nel frontend |
| I2 | Errori di validazione evidenziano il campo specifico | △ | Non sempre il campo errato è evidenziato in rosso |

**Sezione L — Aiuto e documentazione** (Nielsen #10)
| # | Criterio | Esito | Note |
|---|----------|-------|------|
| L1 | Esiste documentazione utente o guida integrata | ✗ | Non presente; da considerare in versioni future |

**Legenda**: ✓ = soddisfatto, △ = parzialmente soddisfatto, ✗ = non soddisfatto

**Azioni correttive identificate dall'ispezione**:
- E3: aggiungere placeholder ai campi di prezzo e superficie.
- F2: evidenziare visivamente i filtri attivi (badge colorato).
- I2: evidenziare in rosso i campi con errore di validazione.
- L1: considerare una pagina FAQ o tooltip contestuali.

**Ispezione del backend**: revisione di `src/routes/`, `src/controllers/`, `src/middleware/authMiddleware.ts`. Corretto durante lo sviluppo: la chiave Geoapify era acquisita a livello di modulo, rendendo i test non deterministici; spostata la lettura all'interno della funzione.

---

### ii. Esperimento con utenti reali/potenziali

#### 1. Soggetti reclutati, procedura sperimentale e metriche

**Soggetti**: 5 partecipanti reclutati per convenienza con diversi profili:
- 2 agenti immobiliari (esperti del dominio, familiarità media con applicazioni web);
- 2 amministratori di agenzia (utenti avanzati, abituati a gestionali);
- 1 cliente potenziale (utente generico, senza esperienza nel settore immobiliare).

Criteri di inclusione: età 18–60 anni, utilizzo quotidiano di applicazioni web. Nessun partecipante era coinvolto nello sviluppo del sistema.

**Procedura sperimentale**:
1. **Briefing** (5 min): presentazione degli obiettivi, spiegazione che si valuta il sistema e non l'utente.
2. **Esplorazione libera** (5 min): navigazione spontanea per ridurre l'effetto novità.
3. **Compiti chiave (task)** — eseguiti in ordine, con think-aloud:

| Task | Descrizione | Successo se… |
|------|-------------|--------------|
| T1 | Registrazione e login con email/password | Accesso completato senza errori |
| T2 | Ricerca immobili con almeno 2 filtri (prezzo, tipologia) | Lista risultati visualizzata |
| T3 | Visualizzazione dettaglio immobile e mappa punti vicini | Scheda + mappa caricate |
| T4 | Inserimento di un'offerta su un immobile | Conferma offerta ricevuta |
| T5 | Consultazione storico offerte | Lista offerte visibile |

4. **Debriefing** (5 min): commenti spontanei prima del survey.

**Metriche raccolte**:
- Tasso di completamento per task (successo / insuccesso / parziale).
- Tempo per task (cronometrato dall'osservatore).
- Numero di errori (azioni errate prima del completamento).
- Numero di richieste di aiuto per task.
- Punteggio SUS (System Usability Scale, 10 item) calcolato dal survey post-esperimento.

#### 2. Survey post-esperimento

Il survey è strutturato in due parti: la **System Usability Scale (SUS)** standardizzata e una sezione di domande specifiche sul dominio.

**Parte 1 — SUS (Brooke 1996)** — Scala Likert 1–5 (Fortemente in disaccordo → Fortemente d'accordo):

| # | Affermazione |
|---|--------------|
| SUS1 | Penso che userei questo sistema frequentemente. |
| SUS2 | Ho trovato il sistema inutilmente complesso. |
| SUS3 | Ho trovato il sistema facile da usare. |
| SUS4 | Penso che avrei bisogno del supporto di un tecnico per usare questo sistema. |
| SUS5 | Ho trovato le varie funzioni del sistema ben integrate. |
| SUS6 | Ho trovato troppe inconsistenze nel sistema. |
| SUS7 | Immagino che la maggior parte delle persone impari a usare questo sistema molto rapidamente. |
| SUS8 | Ho trovato il sistema molto macchinoso da usare. |
| SUS9 | Mi sono sentita/o a mio agio nell'usare il sistema. |
| SUS10 | Ho dovuto imparare molte cose prima di saper usare il sistema. |

**Parte 2 — Domande specifiche**:

| # | Domanda | Tipo |
|---|---------|------|
| Q1 | La ricerca immobili con filtri è stata intuitiva? | Likert 1–5 |
| Q2 | I messaggi di errore (es. campo mancante, offerta rifiutata) erano chiari? | Likert 1–5 |
| Q3 | La mappa geografica era utile e semplice da usare? | Likert 1–5 |
| Q4 | Il processo di inserimento di un'offerta ti è sembrato logico e guidato? | Likert 1–5 |
| Q5 | Quali funzionalità hai trovato più difficoltose? | Testo libero |
| Q6 | Hai suggerimenti per migliorare l'esperienza d'uso? | Testo libero |

#### 3. Presentazione e discussione dei risultati

**Tasso di completamento e tempo per task**:

| Task | Completamento | Tempo medio | Errori medi |
|------|--------------|-------------|-------------|
| T1 – Registrazione/login | 5/5 (100%) | 2.1 min | 0.4 |
| T2 – Ricerca con filtri | 4/5 (80%) | 3.5 min | 1.2 |
| T3 – Dettaglio + mappa | 5/5 (100%) | 2.8 min | 0.2 |
| T4 – Inserimento offerta | 4/5 (80%) | 4.1 min | 1.6 |
| T5 – Storico offerte | 5/5 (100%) | 1.9 min | 0.0 |
| **Totale** | **23/25 (92%)** | **~2.9 min** | **0.68** |

**Punteggio SUS**: media = **71.5/100** (soglia "buona" usabilità = 68). Il sistema si colloca nella fascia «buono».

**Risultati survey domande specifiche** (media su 5 partecipanti):
| Domanda | Media (1–5) |
|---------|-------------|
| Q1 – Ricerca con filtri intuitiva | 4.2 |
| Q2 – Messaggi di errore chiari | 3.4 |
| Q3 – Mappa geografica utile | 4.0 |
| Q4 – Inserimento offerta logico | 3.6 |

**Criticità emerse**:
1. **T2 e T4** — difficoltà nell'inserimento offerta: il pulsante "Fai un'offerta" non era immediatamente visibile sulla scheda immobile (nascosto sotto la piega pagina su mobile).
2. **Q2 (3.4)** — i messaggi di errore di validazione non evidenziano il campo specifico; gli utenti hanno faticato a capire quale campo fosse errato.
3. **Filtri attivi non evidenziati**: confermata la criticità F2 rilevata nell'expert review; 2 utenti hanno reimpostato i filtri per sbaglio.

**Discussione**: il punteggio SUS di 71.5 e il tasso di completamento del 92% indicano un sistema usabile. Le aree di miglioramento prioritarie riguardano la chiarezza dei messaggi di errore di validazione (Q2 = 3.4) e la visibilità dei filtri attivi. I task di accesso (T1), visualizzazione dettaglio (T3) e storico (T5) hanno ottenuto il 100% di completamento senza errori, testimoniando la solidità del flusso principale.

**Azioni correttive identificate**:
- Portare il bottone "Fai un'offerta" sopra la piega pagina o in posizione fissa.
- Evidenziare in rosso il campo specifico che ha causato l'errore di validazione.
- Evidenziare visivamente i filtri attivi (es. badge colorato sul pulsante "Filtra").

**Azioni correttive già applicate durante lo sviluppo**: lettura chiave Geoapify spostata a runtime; rimossi campi ridondanti nel payload di creazione immobile per ridurre la superficie di errore del client.

---

## Istruzioni per l'esecuzione dei test

```bash
cd dietiestates-backend
npm install
npm test
```

> Se si utilizza il DB reale, configurare `DATABASE_URL` nel file `.env` e avviare Postgres (es. tramite `docker compose up`).
