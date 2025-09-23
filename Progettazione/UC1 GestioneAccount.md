# UC1 – Gestione Account

| Campo | Contenuto |
|-------|-----------|
| **Titolo** | Gestione account utente e amministrazione |
| **Attore primario** | Amministratore, Gestore agenzia, Utente registrato |
| **Stakeholder / interessati** | Utente, Amministratore, Gestore agenzia, Sistema di sicurezza |
| **Precondizioni** | Sistema operativo; connessione internet attiva; database accessibile |
| **Postcondizioni** | Account creato/modificato; credenziali salvate in sicurezza; log delle operazioni registrato |
| **Scenario principale** | 1. Attore accede al sistema tramite credenziali <br> 2. Sistema valida l'identità e mostra dashboard <br> 3. Attore seleziona "Gestione Account" <br> 4. Sistema presenta opzioni disponibili in base al ruolo <br> 5. Attore esegue operazione (creazione/modifica/eliminazione) <br> 6. Sistema valida i dati e conferma l'operazione |
| **Flussi alternativi** | **A1**: Credenziali errate → Sistema blocca accesso temporaneo <br> **A2**: Email duplicata → Sistema notifica errore <br> **A3**: Password debole → Sistema richiede conformità ai criteri <br> **A4**: Tentativo eliminazione account in uso → Sistema impedisce operazione |
| **Requisiti speciali** | - Sicurezza: hash SHA-256 + salt per password <br> - Conformità GDPR per dati personali <br> - Autenticazione a due fattori opzionale <br> - Supporto OAuth 2.0 (Google, Facebook) |
| **Frequenza** | Registrazione: 10-20 volte/giorno; Modifiche: 2-5 volte/giorno |
| **Problemi aperti** | Implementazione sistema di recupero password; gestione sessioni scadute |

