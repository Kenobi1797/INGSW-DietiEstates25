FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Installa dipendenze separatamente per sfruttare la cache.
COPY package*.json ./
RUN npm prune \
	&& npm install \
	&& npm dedupe \
	&& npm audit fix

# Copia solo i file necessari all'esecuzione in sviluppo.
COPY tsconfig.json ./
COPY jest.config.ts ./
COPY src ./src
COPY test ./test

# Esegue il processo come utente non-root.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
	&& chown -R appuser:appgroup /usr/src/app
USER appuser

EXPOSE 5000

# Configurazione ottimizzata per ridurre riavvii in sviluppo
CMD ["npm", "run", "dev"]
