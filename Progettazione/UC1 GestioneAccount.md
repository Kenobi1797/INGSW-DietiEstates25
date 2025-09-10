# UC1 – Gestione Account

| Campo | Contenuto |
|-------|-----------|
| **Titolo** | Gestione account utente e amministrazione |
| **Attore primario** | Amministratore, Gestore agenzia, Utente registrato |
| **Stakeholder / interessati** | Utente, Amministratore, Gestore agenzia |
| **Precondizioni** | L’amministratore ha effettuato il login; utente registrato presente (se applicabile) |
| **Postcondizioni** | Nuovo account creato o modificato; credenziali salvate in sicurezza |
| **Scenario principale / Flusso base** | 1. Amministratore accede al pannello <br> 2. Crea/modifica password del proprio account <br> 3. Crea altri account di supporto <br> 4. Gestore crea account per agenti <br> 5. Utente si registra e accede |
| **Flussi alternativi / eccezioni** | - Tentativo di creare account con email già esistente → errore <br> - Password non conforme ai criteri → messaggio di avviso |
| **Requisiti speciali** | Sicurezza credenziali (hashing, salting); supporto login social (Google, Facebook, GitHub) |

**Mock-up:** Inserire schermata pannello amministratore/registrazione utente.

