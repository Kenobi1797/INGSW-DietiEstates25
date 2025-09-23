# Requisiti Non-Funzionali

## Performance e Scalabilità
- L'applicativo deve supportare almeno 100 utenti simultanei
- Le ricerche di immobili devono essere efficienti e performanti anche con grandi volumi di dati
- Il sistema deve rispondere alle richieste di ricerca entro 3 secondi per dataset di medie dimensioni

## Sicurezza
- Tutte le password devono essere salvate criptate utilizzando algoritmi di hashing sicuri 
- Implementazione di meccanismi di salt per le password
- Supporto per autenticazione a due fattori (opzionale)
- Sessioni utente sicure con timeout automatico

## Usabilità e Accessibilità
- L'interfaccia deve essere responsive e accessibile su desktop, tablet e mobile
- Supporto per utenti con disabilità (WCAG 2.1 livello AA)
- Interfaccia intuitiva che non richieda training specifico per gli utenti finali

## Integrazione
- Integrazione obbligatoria con servizi di mappe interattive (Google Maps o equivalenti)
- Integrazione con API Geoapify per analisi automatica dei servizi nelle vicinanze
- Supporto per autenticazione tramite OAuth con provider esterni (Google, Facebook, GitHub)

## Affidabilità
- Backup automatico dei dati immobiliari e degli account utente
- Sistema di logging per audit trail delle operazioni critiche
- Gestione degli errori con messaggi informativi per l'utente

# Requisiti di Dominio

## Categorizzazione Immobili
- Ogni immobile deve essere obbligatoriamente categorizzato come "vendita" o "affitto"
- Preparazione per future categorie: "affitti brevi" e "case vacanze" (non implementate nella versione corrente)

## Gestione Account e Permessi
- Ogni installazione include un account amministratore con credenziali predefinite modificabili
- Gerarchia di permessi: Amministratore → Gestore agenzia → Agente immobiliare → Cliente
- Gli agenti possono gestire offerte solo sugli immobili di loro competenza

## Geolocalizzazione
- Tutte le posizioni geografiche devono essere geocodificate tramite API esterne
- Precisione della posizione a livello di indirizzo civico
- Ricerca geografica supportata almeno a livello di comune/città

## Gestione Offerte
- Tracking completo di tutte le offerte con storico immutabile
- Supporto per offerte esterne al sistema inserite manualmente dagli agenti
- Notifiche automatiche per nuove offerte e cambi di stato

## Validazione Automatica
- Verifica automatica dei servizi nelle vicinanze tramite API Geoapify
- Associazione automatica di indicatori di prossimità alle inserzioni
- Controllo della validità degli indirizzi durante l'inserimento

## Conformità Normativa
- Rispetto delle normative sulla privacy (GDPR)
- Gestione del consenso per il trattamento dei dati personali
- Diritto all'oblio e portabilità dei datiti Non-Funzionali
- L'applicativo deve supportare almeno 100 utenti simultanei.
- Tutte le password devono essere salvate criptate.
- L’interfaccia deve essere responsive e accessibile su desktop e mobile.

# Requisiti di Dominio
- Ogni immobile deve essere categorizzato come "vendita" o "affitto".
- Gli agenti possono gestire offerte solo sugli immobili di loro competenza.
- Le posizioni geografiche devono essere geocodificate tramite API esterne.
