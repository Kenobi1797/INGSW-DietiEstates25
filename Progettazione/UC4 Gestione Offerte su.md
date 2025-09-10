# UC4 – Gestione Offerte su Immobili

| Campo | Contenuto |
|-------|-----------|
| **Titolo** | Gestione offerte sugli immobili |
| **Attore primario** | Utente registrato (cliente), Agente immobiliare |
| **Stakeholder / interessati** | Cliente, Agente, Amministratore |
| **Precondizioni** | Immobile pubblicato; utente autenticato |
| **Postcondizioni** | Offerta salvata; storico aggiornato; notifiche inviate |
| **Scenario principale / Flusso base** | 1. Cliente visualizza immobile <br> 2. Inserisce prezzo offerta <br> 3. Invia offerta <br> 4. Sistema registra offerta <br> 5. Agente visualizza e accetta/rifiuta/contropropone <br> 6. Sistema aggiorna stato e notifica cliente |
| **Flussi alternativi / eccezioni** | - Offerta superiore al prezzo massimo → messaggio di avviso <br> - Offerta esterna → agente inserisce manualmente nello storico |
| **Requisiti speciali** | Audit trail; notifiche; tracking storico offerte |

**Mock-up:** Inserire schermata offerta e storico offerte.

