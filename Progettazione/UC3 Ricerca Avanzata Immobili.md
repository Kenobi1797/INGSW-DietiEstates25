# UC3 – Ricerca Avanzata Immobili

| Campo | Contenuto |
|-------|-----------|
| **Titolo** | Ricerca avanzata di immobili con filtri multipli e visualizzazione su mappa |
| **Attore primario** | Utente registrato, Guest (utente non registrato) |
| **Stakeholder / interessati** | Utenti/Clienti, Agenti immobiliari, Gestore agenzia |
| **Precondizioni** | Sistema con immobili pubblicati; accesso al sistema (autenticato o guest); mappa interattiva funzionante |
| **Postcondizioni** | Lista risultati di ricerca visualizzata con dettagli; risultati mostrati su mappa interattiva; filtri applicati correttamente |
| **Scenario principale / Flusso base** | 1. Utente accede alla pagina "Ricerca Immobili" <br> 2. Seleziona parametri di ricerca: <br> &nbsp;&nbsp;&nbsp;- **Tipologia inserzione** (vendita/affitto) <br> &nbsp;&nbsp;&nbsp;- **Range prezzo** (min/max) <br> &nbsp;&nbsp;&nbsp;- **Numero stanze** (min/max) <br> &nbsp;&nbsp;&nbsp;- **Numero bagni** (opzionale) <br> &nbsp;&nbsp;&nbsp;- **Classe energetica** (A+, A, B, C, D, E, F, G) <br> &nbsp;&nbsp;&nbsp;- **Posizione geografica** (comune/città con autocompletamento) <br> &nbsp;&nbsp;&nbsp;- **Dimensioni** (mq min/max) <br> &nbsp;&nbsp;&nbsp;- **Piano** (con opzioni: piano terra, ultimo piano, con ascensore) <br> &nbsp;&nbsp;&nbsp;- **Servizi aggiuntivi** (garage, climatizzazione, portineria, etc.) <br> &nbsp;&nbsp;&nbsp;- **Indicatori prossimità** (vicino a scuole, parchi, trasporti) <br> 3. **[Opzionale]** Attiva ricerca per raggio: <br> &nbsp;&nbsp;&nbsp;- Seleziona punto di interesse sulla mappa <br> &nbsp;&nbsp;&nbsp;- Imposta raggio di ricerca (500m, 1km, 2km, 5km, 10km) <br> 4. Avvia ricerca cliccando "Cerca" <br> 5. Sistema elabora query con ottimizzazioni per performance <br> 6. **Risultati mostrati in due modalità:** <br> &nbsp;&nbsp;&nbsp;- **Lista dettagliata** con foto, info principali e link dettaglio <br> &nbsp;&nbsp;&nbsp;- **Mappa interattiva** con pin colorati per tipologia e clustering automatico <br> 7. Utente può ordinare risultati per: prezzo, data inserimento, dimensioni, distanza (se ricerca per raggio) <br> 8. Utente può salvare ricerca (solo se registrato) per notifiche future |
| **Flussi alternativi / eccezioni** | **4a.** Nessun risultato trovato: <br> &nbsp;&nbsp;&nbsp;- Sistema mostra "Nessun immobile trovato con i criteri selezionati" <br> &nbsp;&nbsp;&nbsp;- Suggerisce di allargare i criteri di ricerca <br> &nbsp;&nbsp;&nbsp;- Offre ricerca simile con criteri rilassati <br> **4b.** Troppi risultati (>1000): <br> &nbsp;&nbsp;&nbsp;- Sistema mostra primi 1000 con paginazione <br> &nbsp;&nbsp;&nbsp;- Suggerisce di raffinare i filtri <br> **3a.** Ricerca per raggio non disponibile: <br> &nbsp;&nbsp;&nbsp;- Sistema disabilita opzione e continua con ricerca standard <br> **5a.** Timeout ricerca (>10 secondi): <br> &nbsp;&nbsp;&nbsp;- Sistema mostra risultati parziali se disponibili <br> &nbsp;&nbsp;&nbsp;- Propone di riprovare o contattare supporto <br> **2a.** Filtri non validi (es. prezzo min > prezzo max): <br> &nbsp;&nbsp;&nbsp;- Sistema evidenzia errore e impedisce ricerca <br> &nbsp;&nbsp;&nbsp;- Mostra suggerimenti di correzione |
| **Scenari di estensione** | **8a.** Utente registrato salva ricerca: <br> &nbsp;&nbsp;&nbsp;- Sistema salva criteri con nome personalizzato <br> &nbsp;&nbsp;&nbsp;- Abilita notifiche per nuovi immobili corrispondenti <br> **6a.** Visualizzazione risultati in modalità griglia/lista: <br> &nbsp;&nbsp;&nbsp;- Toggle tra diverse visualizzazioni <br> **7a.** Esportazione risultati (solo utenti registrati): <br> &nbsp;&nbsp;&nbsp;- PDF con lista immobili <br> &nbsp;&nbsp;&nbsp;- Email con dettagli selezionati |
| **Requisiti speciali** | - **Performance critica**: ricerca deve completarsi entro 3 secondi per dataset normali <br> - **Indicizzazione database** ottimizzata per ricerche geografiche e multi-criterio <br> - **Caching intelligente** per ricerche frequenti <br> - **Mappa interattiva** con clustering per grandi quantità di risultati <br> - **Autocompletamento** per ricerca geografica <br> - **Ricerca per raggio** opzionale ma apprezzata <br> - **Responsive design** per mobile e desktop |
| **Frequenza di utilizzo** | Molto alta - funzionalità core dell'applicazione |
| **Requisiti di performance** | - Caricamento pagina ricerca < 2 secondi <br> - Esecuzione ricerca standard < 3 secondi <br> - Ricerca per raggio < 5 secondi <br> - Rendering mappa con risultati < 2 secondi |

**Mock-up necessario:** Schermata ricerca con pannello filtri laterale, mappa principale con risultati, lista risultati con ordinamento, e modalità ricerca per raggio con selezione interattiva.a Avanzata Immobili

| Campo | Contenuto |
|-------|-----------|
| **Titolo** | Ricerca avanzata di immobili |
| **Attore primario** | Utente registrato / guest |
| **Stakeholder / interessati** | Utente, Agente, Amministratore |
| **Precondizioni** | Utente autenticato o guest; immobili presenti nel database |
| **Postcondizioni** | Lista risultati visualizzata; eventuali filtri applicati |
| **Scenario principale / Flusso base** | 1. Utente apre pagina ricerca <br> 2. Seleziona parametri: tipologia, prezzo, stanze, classe energetica, posizione <br> 3. Esegue ricerca <br> 4. Sistema mostra risultati su mappa interattiva e lista |
| **Flussi alternativi / eccezioni** | - Nessun risultato trovato → messaggio “Nessun immobile trovato” <br> - Filtri non validi → correzione input |
| **Requisiti speciali** | Efficienza e performance ricerca; possibilità di ricerche per raggio (opzionale) |

