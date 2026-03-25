import rateLimit from 'express-rate-limit';

// Rate limiter per le rotte di autenticazione (login/registrazione)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 20, // max 20 richieste per finestra
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppi tentativi, riprova tra qualche minuto' },
});

// Rate limiter generale per le API
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // max 100 richieste al minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppe richieste, riprova tra qualche secondo' },
});
